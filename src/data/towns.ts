export interface TownSource {
  title: string;
  url: string;
  accessedAt: string;
}

export interface TownMetric {
  label: string;
  value: string;
  source: TownSource;
  updatedAt: string;
}

export interface TownTimelineItem {
  date: string;
  title: string;
  description?: string;
  source: TownSource;
}

export interface Town {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  city: string;
  color: string;
  mapCenter: { longitude: number; latitude: number };
  metroCity: string;
  industryTags: string[];
  representativeEnterpriseIds: string[];
  metrics?: TownMetric[];
  highlights?: string[];
  timeline?: TownTimelineItem[];
}

export const townsData: Record<string, Town> = {
  dream: {
    id: 'dream', name: '梦想小镇', subtitle: '创业孵化与应用创新', city: '杭州 · 余杭', color: '#67e8f9', mapCenter: { longitude: 119.988, latitude: 30.292 },
    description: '以青年创新创业、科技项目孵化和应用创新为主要特色，关注智能硬件、数字平台与创业服务。', metroCity: '杭州', industryTags: ['创业孵化', '数字平台', '智能硬件'], representativeEnterpriseIds: ['MX-001', 'MX-002'], highlights: ['青年创新创业', '科技项目孵化', '应用创新'],
  },
  ai: {
    id: 'ai', name: '人工智能小镇/未来科技城', subtitle: '前沿智能技术与成果转化', city: '杭州 · 余杭', color: '#a5b4fc', mapCenter: { longitude: 119.967, latitude: 30.264 },
    description: '聚集人工智能、脑机接口、空间智能和医疗机器人等前沿技术方向，连接科研平台与产业化应用。', metroCity: '杭州', industryTags: ['人工智能', '成果转化', '空间智能'], representativeEnterpriseIds: ['AI-001', 'AI-002'], highlights: ['脑机接口', '空间智能', '医疗机器人'],
  },
  computing: {
    id: 'computing', name: '中国（杭州）算力小镇', subtitle: '数算模用产业底座', city: '杭州 · 临平', color: '#fbbf24', mapCenter: { longitude: 120.25, latitude: 30.4 },
    description: '围绕数据资源、算力设施、芯片设计和行业模型应用，探索“数—算—模—用”协同链条。', metroCity: '杭州', industryTags: ['算力基础设施', '芯片设计', '行业模型'], representativeEnterpriseIds: ['SL-001', 'SL-002'], highlights: ['数据资源', '算力设施', '行业模型应用'],
  },
  deqing: {
    id: 'deqing', name: '德清地理信息小镇', subtitle: '时空数据与地理信息应用', city: '湖州 · 德清', color: '#34d399', mapCenter: { longitude: 119.96, latitude: 30.54 },
    description: '以测绘遥感、北斗时空、地理信息平台和行业应用为核心，形成“地理信息+”产业生态。', metroCity: '湖州', industryTags: ['时空数据', '北斗遥感', '地理信息'], representativeEnterpriseIds: ['DQ-001', 'DQ-002'], highlights: ['测绘遥感', '北斗时空', '地理信息平台'],
  },
  yuecheng: {
    id: 'yuecheng', name: '越城集成电路小镇', subtitle: '集成电路制造与封装测试', city: '绍兴 · 越城', color: '#38bdf8', mapCenter: { longitude: 120.5833, latitude: 30.05 },
    description: '围绕晶圆制造、MEMS、功率器件、图像传感器与先进封装，呈现制造型产业链的关键能力。', metroCity: '绍兴', industryTags: ['集成电路', 'MEMS', '先进封装'], representativeEnterpriseIds: ['SX-001', 'SX-004'], highlights: ['晶圆制造', '功率器件', '图像传感器'],
  },
  jiashan: {
    id: 'jiashan', name: '嘉善归谷智造小镇', subtitle: '交叉技术与高端装备', city: '嘉兴 · 嘉善', color: '#f472b6', mapCenter: { longitude: 120.92, latitude: 30.84 },
    description: '依托海归人才与成果转化，覆盖工业无人机、量子探测、生命科学工具和智能医疗装备。', metroCity: '嘉兴', industryTags: ['智能装备', '量子探测', '工业无人机'], representativeEnterpriseIds: ['JS-001', 'JS-004'], highlights: ['工业无人机', '生命科学工具', '智能医疗装备'],
  },
};

export const metroCities = [
  { name: '杭州', longitude: 120.15, latitude: 30.27 },
  { name: '湖州', longitude: 120.09, latitude: 30.89 },
  { name: '嘉兴', longitude: 120.76, latitude: 30.75 },
  { name: '绍兴', longitude: 120.58, latitude: 30.01 },
];

export const industryCollaborations = [
  { from: 'dream', to: 'ai', label: '创业孵化到技术转化' },
  { from: 'ai', to: 'computing', label: '模型研发到算力支撑' },
  { from: 'computing', to: 'deqing', label: '算力与时空数据应用' },
  { from: 'yuecheng', to: 'jiashan', label: '芯片、传感器与智能装备' },
] as const;
