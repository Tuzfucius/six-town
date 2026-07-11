import { parse } from 'yaml';
import type { Enterprise, EnterpriseSource, VerificationStatus } from '../types/enterprise';

const modules = import.meta.glob<string>('../content/enterprises/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const validStatuses: VerificationStatus[] = ['已核验', '部分核验', '待核验'];

function splitFrontMatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error('企业资料缺少 Front Matter');
  return { attributes: parse(match[1]) as Record<string, unknown>, body: match[2].trim() };
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function toSources(value: unknown): EnterpriseSource[] {
  if (!Array.isArray(value)) return [];
  return value.filter((source): source is EnterpriseSource => {
    return typeof source === 'object' && source !== null && 'title' in source && 'url' in source;
  });
}

function createEnterprise(raw: string): Enterprise {
  const { attributes, body } = splitFrontMatter(raw);
  const status = String(attributes.verificationStatus ?? '待核验') as VerificationStatus;
  if (!validStatuses.includes(status)) throw new Error(`无效核验状态：${status}`);
  const required = ['id', 'name', 'townId', 'townName', 'summary'];
  for (const key of required) {
    if (!String(attributes[key] ?? '').trim()) throw new Error(`企业资料缺少字段：${key}`);
  }
  return {
    id: String(attributes.id), name: String(attributes.name), aliases: toStringList(attributes.aliases),
    townId: String(attributes.townId), townName: String(attributes.townName),
    enterpriseType: String(attributes.enterpriseType ?? '待核验'), contactFlag: String(attributes.contactFlag ?? ''),
    primaryIndustry: String(attributes.primaryIndustry ?? '待核验'), secondaryIndustries: toStringList(attributes.secondaryIndustries),
    industryChainPosition: String(attributes.industryChainPosition ?? '待核验'), address: String(attributes.address ?? '待核验'),
    addressNature: String(attributes.addressNature ?? '待核验'), townRelationship: String(attributes.townRelationship ?? '待核验'),
    verificationStatus: status, officialWebsite: String(attributes.officialWebsite ?? ''),
    summary: String(attributes.summary), productsAndTechnology: toStringList(attributes.productsAndTechnology),
    industryRole: String(attributes.industryRole ?? '待补充'), sources: toSources(attributes.sources),
    researchNotes: String(attributes.researchNotes ?? ''), updatedAt: String(attributes.updatedAt ?? ''), body,
  };
}

export const enterprises = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/README.md'))
  .map(([, raw]) => createEnterprise(raw))
  .sort((a, b) => a.id.localeCompare(b.id));

export function getEnterprisesByTown(townId: string) {
  return enterprises.filter((enterprise) => enterprise.townId === townId);
}

export function getIndustryFilters(enterpriseList: Enterprise[]) {
  return [...new Set(enterpriseList.map((enterprise) => enterprise.primaryIndustry).filter(Boolean))].sort();
}
