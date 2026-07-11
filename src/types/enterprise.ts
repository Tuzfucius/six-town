export interface EnterpriseSource {
  title: string;
  url: string;
  type: '企业官网' | '政府/园区' | '原始披露' | '权威媒体';
  accessedAt: string;
}

export interface Enterprise {
  id: string;
  name: string;
  aliases: string[];
  townId: string;
  townName: string;
  enterpriseType: string;
  contactFlag: string;
  primaryIndustry: string;
  secondaryIndustries: string[];
  industryChainPosition: string;
  address: string;
  addressNature: string;
  townRelationship: string;
  officialWebsite: string;
  summary: string;
  productsAndTechnology: string[];
  industryRole: string;
  sources: EnterpriseSource[];
  researchNotes: string;
  updatedAt: string;
  body: string;
}
