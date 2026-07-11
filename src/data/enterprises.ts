import { parse } from 'yaml';
import type { Enterprise, EnterpriseSource } from '../types/enterprise';

const modules = import.meta.glob<string>('../content/enterprises/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function splitFrontMatter(raw: string) {
  const normalized = raw.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error('企业资料缺少 Front Matter');
  return { attributes: parse(match[1]) as Record<string, unknown>, body: match[2].trim() };
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map(toPublicText) : [];
}

function toPublicText(value: unknown): string {
  return String(value ?? '')
    .replaceAll('待核验', '公开资料未提供')
    .replaceAll('部分核验', '')
    .replaceAll('已核验', '');
}

function toSources(value: unknown): EnterpriseSource[] {
  if (!Array.isArray(value)) return [];
  return value.filter((source): source is EnterpriseSource => {
    return typeof source === 'object' && source !== null && 'title' in source && 'url' in source;
  });
}

function createEnterprise(raw: string): Enterprise {
  const { attributes, body } = splitFrontMatter(raw);
  const required = ['id', 'name', 'townId', 'townName', 'summary'];
  for (const key of required) {
    if (!String(attributes[key] ?? '').trim()) throw new Error(`企业资料缺少字段：${key}`);
  }
  return {
    id: String(attributes.id), name: String(attributes.name), aliases: toStringList(attributes.aliases),
    townId: String(attributes.townId), townName: String(attributes.townName),
    enterpriseType: toPublicText(attributes.enterpriseType || '企业资料'), contactFlag: toPublicText(attributes.contactFlag),
    primaryIndustry: toPublicText(attributes.primaryIndustry || '产业资料'), secondaryIndustries: toStringList(attributes.secondaryIndustries),
    industryChainPosition: toPublicText(attributes.industryChainPosition || '公开资料未提供'), address: toPublicText(attributes.address || '公开资料未提供'),
    addressNature: toPublicText(attributes.addressNature || '公开资料未提供'), townRelationship: toPublicText(attributes.townRelationship || '公开资料未提供'),
    officialWebsite: String(attributes.officialWebsite ?? ''),
    summary: toPublicText(attributes.summary), productsAndTechnology: toStringList(attributes.productsAndTechnology),
    industryRole: toPublicText(attributes.industryRole || '公开资料未提供'), sources: toSources(attributes.sources),
    researchNotes: toPublicText(attributes.researchNotes), updatedAt: String(attributes.updatedAt ?? ''), body,
  };
}

export const enterprises = Object.entries(modules)
  .flatMap(([path, raw]) => {
    if (/[\\/]README\.md$/i.test(path)) return [];
    try {
      return [createEnterprise(raw)];
    } catch (error) {
      console.warn(`已跳过无法解析的企业资料：${path}`, error);
      return [];
    }
  })
  .filter((enterprise) => enterprise.officialWebsite || enterprise.sources.length > 0)
  .sort((a, b) => a.id.localeCompare(b.id));

export function getEnterprisesByTown(townId: string) {
  return enterprises.filter((enterprise) => enterprise.townId === townId);
}

export function getIndustryFilters(enterpriseList: Enterprise[]) {
  return [...new Set(enterpriseList.map((enterprise) => enterprise.primaryIndustry).filter(Boolean))].sort();
}
