export interface Town {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  city: string;
  color: string;
}

export const townsData: Record<string, Town> = {
  dream: {
    id: 'dream', name: '梦想小镇', subtitle: '创业孵化与应用创新', city: '杭州 · 余杭', color: '#67e8f9',
    description: '以青年创新创业、科技项目孵化和应用创新为主要特色，关注智能硬件、数字平台与创业服务。',
  },
  ai: {
    id: 'ai', name: '人工智能小镇/未来科技城', subtitle: '前沿智能技术与成果转化', city: '杭州 · 余杭', color: '#a5b4fc',
    description: '聚集人工智能、脑机接口、空间智能和医疗机器人等前沿技术方向，连接科研平台与产业化应用。',
  },
  computing: {
    id: 'computing', name: '中国（杭州）算力小镇', subtitle: '数算模用产业底座', city: '杭州 · 临平', color: '#fbbf24',
    description: '围绕数据资源、算力设施、芯片设计和行业模型应用，探索“数—算—模—用”协同链条。',
  },
  deqing: {
    id: 'deqing', name: '德清地理信息小镇', subtitle: '时空数据与地理信息应用', city: '湖州 · 德清', color: '#34d399',
    description: '以测绘遥感、北斗时空、地理信息平台和行业应用为核心，形成“地理信息+”产业生态。',
  },
  yuecheng: {
    id: 'yuecheng', name: '越城集成电路小镇', subtitle: '集成电路制造与封装测试', city: '绍兴 · 越城', color: '#38bdf8',
    description: '围绕晶圆制造、MEMS、功率器件、图像传感器与先进封装，呈现制造型产业链的关键能力。',
  },
  jiashan: {
    id: 'jiashan', name: '嘉善归谷智造小镇', subtitle: '交叉技术与高端装备', city: '嘉兴 · 嘉善', color: '#f472b6',
    description: '依托海归人才与成果转化，覆盖工业无人机、量子探测、生命科学工具和智能医疗装备。',
  },
};
