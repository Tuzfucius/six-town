import type { Enterprise } from '../types/enterprise';

export interface ExplorationRoute {
  id: string;
  name: string;
  description: string;
  townIds: string[];
  tags: string[];
}

export const explorationRoutes: ExplorationRoute[] = [
  {
    id: 'ai-computing',
    name: '人工智能与算力',
    description: '从创业孵化、前沿模型研发走向算力基础设施与行业应用。',
    townIds: ['dream', 'ai', 'computing'],
    tags: ['创业孵化', '人工智能', '算力基础设施'],
  },
  {
    id: 'chips-equipment',
    name: '芯片与智能装备',
    description: '串联芯片设计、晶圆制造、传感器与智能装备应用。',
    townIds: ['computing', 'yuecheng', 'jiashan'],
    tags: ['芯片设计', '集成电路', '智能装备'],
  },
  {
    id: 'geospatial',
    name: '地理信息应用',
    description: '沿着算力支撑、时空数据处理与地理信息行业应用展开。',
    townIds: ['computing', 'deqing'],
    tags: ['算力基础设施', '时空数据', '地理信息'],
  },
];

export const industryChainStages = [
  { id: 'upstream', label: '上游基础与核心技术', keyword: '主要位于上游' },
  { id: 'midstream', label: '中游技术与产品', keyword: '主要位于中游' },
  { id: 'downstream', label: '下游应用与服务', keyword: '主要位于下游' },
] as const;

export type IndustryChainStageId = (typeof industryChainStages)[number]['id'];

export function getEnterpriseChainStage(enterprise: Enterprise): IndustryChainStageId {
  const position = enterprise.industryChainPosition;
  if (position.includes('主要位于上游')) return 'upstream';
  if (position.includes('主要位于下游')) return 'downstream';
  return 'midstream';
}
