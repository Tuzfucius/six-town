export const townsData: Record<string, any> = {
  yuecheng: {
    id: 'yuecheng',
    name: '越城集成电路小镇',
    subtitle: '“芯”引擎',
    description: '越城集成电路小镇聚焦“软—融—算—空—芯—智”中的“芯”动能。依托中芯、长电等链主企业，打造国家级集成电路产业高地，重塑长三角数字底座。',
    city: 'Shaoxing · Yuecheng',
    mapCoords: { longitude: 120.5833, latitude: 30.05 },
    stats: { key: '42', keyLabel: '重点企业', scale: '18', scaleLabel: '规上企业', platform: '5', platformLabel: '创新平台' },
    industryLinks: [
      { name: '制造 (Manufacturing)', color: '#00d2ff' },
      { name: '设计 (Design)', color: '#A4F4FD' },
      { name: '封测 (Packaging)', color: '#f59e0b' },
      { name: '设备与材料 (Equipment)', color: '#10b981' }
    ],
    companies: [
      { name: '中芯集成 (SMEC)', time: '9:41 AM', tag: '晶圆代工头部企业', desc: '中芯绍兴项目是浙江省集成电路...', active: true },
      { name: '长电科技 (JCET)', time: '8:12 AM', tag: '先进封装测试基地', desc: '致力于提供高端晶圆级封装技术...' },
      { name: '最成半导体', time: 'Yesterday', tag: '半导体材料与核心设备', desc: '解决产业链上游“卡脖子”关键技术...' },
      { name: '豪威科技', time: 'Yesterday', tag: 'CMOS图像传感器设计', desc: '全球领先的数字图像解决方案提供商...' },
      { name: '比亚迪半导体', time: 'Mon', tag: '功率半导体研发生产', desc: '新能源汽车IGBT芯片核心生产基地...' }
    ],
    detail: {
      title: '中芯集成 (SMEC) 晶圆代工基地',
      avatarLabel: '中',
      sender: '中芯集成 (SMEC)',
      tag: '制造',
      aiSummary: '中芯绍兴项目是浙江省集成电路产业核心重大项目，主营MEMS和功率器件，当前产能爬坡顺利，引领越城集成电路小镇的规模效应。建议重点关注其上下游配套企业的招商引入。',
      content: [
        '尊敬的调研团队，',
        '绍兴中芯集成电路制造股份有限公司（简称“中芯集成”）成立于2018年，是越城集成电路小镇的超级“链主”。',
        '公司主要提供特色工艺集成电路及模块的代工服务，特别是在微机电系统（MEMS）和功率器件（IGBT、MOSFET）领域处于国内领先地位。中芯集成的落地，直接带动了长电科技等一批重量级封测企业及设备材料企业的集聚，完美诠释了“链主引领、全链协同”的新质生产力发展模式。',
        '如果您需要了解最新的产能数据或相关技术节点的突破情况，请查阅附件报告。'
      ],
      attachment: 'smec-q3-report.pdf'
    },
    triage: {
      title: '一图看懂全产业链结构',
      desc: '越城集成电路小镇不仅有庞大的单体制造工厂，更在系统性地构建“设计—制造—封测—设备材料”的完整生态。聚焦核心环节，精准施策，打造真正的新质生产力集群。',
      chips: ['芯片设计', '晶圆代工', '先进封测', '半导体设备'],
      categories: [
        { name: '晶圆制造 (Manufacturing)', count: '4 企业', desc: '中芯集成 · 比亚迪半导体 · 芯联集成', color: '#00d2ff' },
        { name: '封装测试 (Packaging)', count: '7 企业', desc: '长电科技绍兴基地 · 华东微电子', color: '#f59e0b' },
        { name: '芯片设计 (Design)', count: '18 企业', desc: '豪威科技 · 艾为电子 · 矽力杰', color: '#A4F4FD' },
        { name: '设备材料 (Equipment & Materials)', count: '13 企业', desc: '最成半导体 · 芯测科技 · 电子化学品专区', color: '#10b981' }
      ]
    },
    logos: ['中芯集成', '长电科技', '豪威科技', '比亚迪半导体', '最成半导体', '芯联集成'],
    testimonials: [
      { quote: '越城集成电路小镇补齐了浙江省在集成电路制造环节的短板，形成了真正的产业集群，这是新质生产力的直观体现。', name: '张明', role: '集成电路产业研究员', company: '长三角智库' },
      { quote: '这里的营商环境和政策支持是无与伦比的。从落地到投产，创造了令人惊叹的\'绍兴速度\'，极大缩短了企业达产周期。', name: '李建国', role: '高级制造总监', company: '园区入驻企业' },
      { quote: '不仅有中芯集成这样的超级链主，更有大量的上下游创新团队聚集，产业生态正在爆发出惊人的活力。', name: '王浩宇', role: '科技基金合伙人', company: '产业投资基金' }
    ],
    pricing: {
      watermark1: '集成电路.',
      watermark2: '“芯”引擎',
      cards: [
        { tier: '创新驱动', title: '设计研发', desc: '依托区域高校与研究院所，聚焦芯片架构与核心算法，赋能产业上游。', features: ['AI 芯片设计与架构', '传感器研发创新中心', '车规级半导体方案', '知识产权与 EDA 平台服务'], btn: '查看设计企业', pro: false },
        { tier: '核心环节', title: '制造与封测', desc: '链主企业引领，打造长三角最具竞争力的先进半导体制造基地。', features: ['MEMS 与功率器件先进制程代工', '晶圆级先进封装产线', '第三代半导体量产储备', '千亿级总规划产能空间', '国家级战略支持'], btn: '查看链主企业', pro: true, tierColor: 'text-[#3D81E3]' },
        { tier: '产业基石', title: '设备与材料', desc: '夯实产业基础，推动关键半导体设备与高端材料的国产化替代。', features: ['高纯电子化学品研发', '大尺寸硅片与外延制造', '半导体专用设备部件', '高端封装材料与基板'], btn: '查看配套平台', pro: false }
      ]
    },
    finalCta: { title: '跳出单点，纵览全局。\\n洞察越城新动能。', desc: '加入长三角集成电路产业集群，与顶尖企业共同定义数字基础设施的新质生产力。' },
    mapData: {
      markers: [
        { name: '晶圆制造核心区', desc: '中芯集成、芯联集成等链主企业所在地，总占地面积约 2000 亩。', color: '#00d2ff' },
        { name: '先进封测产业园', desc: '以长电科技绍兴基地为核心，配套高端封装测试产业链。', color: '#f59e0b' },
        { name: '芯片设计与创新中心', desc: '汇聚豪威科技等数十家 IC 设计企业，紧邻核心制造区，实现产研协同。', color: '#A4F4FD' }
      ]
    }
  },
  dream: {
    id: 'dream',
    name: '梦想小镇',
    subtitle: '“软”生态',
    description: '梦想小镇聚焦“软”实力，是互联网创业与创新的摇篮。为新质生产力提供源源不断的商业模式创新和软件技术支撑。',
    city: 'Hangzhou · Yuhang',
    mapCoords: { longitude: 119.988, latitude: 30.292 },
    stats: { key: '200+', keyLabel: '创业团队', scale: '50', scaleLabel: '亿元基金', platform: '12', platformLabel: '孵化空间' },
    industryLinks: [
      { name: '数字经济 (Digital Economy)', color: '#00d2ff' },
      { name: '电子商务 (E-Commerce)', color: '#A4F4FD' },
      { name: '文化创意 (Cultural Creative)', color: '#f59e0b' },
      { name: '科技金融 (Fintech)', color: '#10b981' }
    ],
    companies: [
      { name: '遥望科技', time: '10:05 AM', tag: '直播电商龙头', desc: '构建数字化直播运营新生态...', active: true },
      { name: '微链', time: '9:30 AM', tag: '创新创业服务平台', desc: '链接创业者与投资人的桥梁...' },
      { name: '涂鸦智能', time: 'Yesterday', tag: '全球化IoT开发平台', desc: '赋能万物互联，打造智能底座...' },
      { name: '章鱼网络', time: 'Yesterday', tag: 'Web3 基础设施', desc: '提供去中心化应用的多链网络...' }
    ],
    detail: {
      title: '梦想小镇互联网村',
      avatarLabel: '梦',
      sender: '梦想小镇管委会',
      tag: '孵化',
      aiSummary: '梦想小镇累计孵化超3000个创业项目，集聚大量软件工程、数字营销、产品创新人才。这里的“软”生态是驱动其他硬件产业迭代的灵魂。',
      content: [
        '各位创业者与研究员：',
        '梦想小镇位于杭州未来科技城核心区，是在一片保留了江南水乡风貌的土地上长出的互联网创新高地。',
        '我们以“泛大学生群体”为主要服务对象，提供从种子期到成熟期的全生命周期服务。这里不仅有低成本的办公空间，更重要的是拥有高密度的资本、技术与人才交流圈。',
        '“我负责阳光雨露，你负责茁壮成长”是我们不变的承诺。'
      ],
      attachment: 'dream-town-guide.pdf'
    },
    triage: {
      title: '解析创新的发生地',
      desc: '从一个个点子到估值亿万的独角兽，这里不仅提供物理空间，更提供了一套完整的创新加速体系。',
      chips: ['天使基金', '孵化器', '众创空间', '独角兽'],
      categories: [
        { name: '互联网平台', count: '120 团队', desc: '电商、SaaS、生活服务...', color: '#00d2ff' },
        { name: '前沿科技应用', count: '45 团队', desc: 'AI应用、Web3、元宇宙...', color: '#f59e0b' },
        { name: '科技金融', count: '30 机构', desc: '天使投资、VC机构...', color: '#A4F4FD' },
        { name: '专业服务', count: '15 机构', desc: '法务、财务、知识产权...', color: '#10b981' }
      ]
    },
    logos: ['遥望网络', '涂鸦智能', '微链', '有赞', '网易', '同盾科技'],
    testimonials: [
      { quote: '在梦想小镇，喝杯咖啡的时间可能就会促成一次天使投资。这里的创新浓度让人兴奋。', name: '陈先生', role: '连续创业者', company: '入驻企业' },
      { quote: '这里的环境保留了江南的水乡温婉，但节奏却是硅谷式的。古老与未来的碰撞激发了无数灵感。', name: '李总', role: '合伙人', company: '知名VC机构' }
    ],
    pricing: {
      watermark1: '软件驱动.',
      watermark2: '创新生态',
      cards: [
        { tier: '萌芽', title: '种子孵化', desc: '为初创团队提供低成本甚至零成本的启动环境。', features: ['免费办公位申请', '基础工商注册服务', '公共会议室与网络', '创业导师一对一'], btn: '了解孵化器', pro: false },
        { tier: '加速', title: '成长期加速', desc: '当项目验证了商业模式，我们提供推波助澜的加速包。', features: ['人才公寓优先配租', '最高百万级天使基金', '云服务及软件补贴', '核心媒体曝光机会', '大企业对接通道'], btn: '申请加速包', pro: true, tierColor: 'text-[#3D81E3]' },
        { tier: '腾飞', title: '独角兽培育', desc: '针对准独角兽企业，提供一事一议的定制化政策支持。', features: ['定制化独栋办公', '产业引导基金领投', '上市辅导绿色通道', '高管子女就学保障'], btn: '对接管委会', pro: false }
      ]
    },
    finalCta: { title: '在这里，\n让梦想照进现实。', desc: '成为数万创业大军中的一员，用一行行代码改变世界。' },
    mapData: {
      markers: [
        { name: '互联网村', desc: '核心孵化区域，由旧粮仓和老厂房改造而成，保留江南韵味。', color: '#00d2ff' },
        { name: '天使村', desc: '集聚各类创投机构，是小镇的资本引擎。', color: '#f59e0b' },
        { name: '创业集市', desc: '提供一站式公共服务，包括路演中心、咖啡馆、服务窗口。', color: '#A4F4FD' }
      ]
    }
  },
  ai: {
    id: 'ai',
    name: '人工智能小镇',
    subtitle: '“智”高点',
    description: '人工智能小镇/未来科技城是“智”的源泉。这里汇聚了顶尖的AI算法大牛、科研机构和前沿科技企业，探索智能时代的无限可能。',
    city: 'Hangzhou · Yuhang',
    mapCoords: { longitude: 119.967, latitude: 30.264 },
    stats: { key: '15+', keyLabel: '科研院所', scale: '300+', scaleLabel: 'AI企业', platform: '3', platformLabel: '超算节点' },
    industryLinks: [
      { name: '基础大模型 (Foundation Models)', color: '#00d2ff' },
      { name: '智能机器人 (Robotics)', color: '#A4F4FD' },
      { name: '智慧医疗 (Smart Healthcare)', color: '#f59e0b' },
      { name: '视觉与语音 (Vision & Speech)', color: '#10b981' }
    ],
    companies: [
      { name: '阿里达摩院', time: '11:20 AM', tag: '前沿基础研究', desc: '探索未知科技，立足基础科学与颠覆性技术研发...', active: true },
      { name: '之江实验室', time: '10:45 AM', tag: '国家级科研平台', desc: '主攻智能感知、人工智能、智能计算等核心领域...' },
      { name: '强脑科技 (BrainCo)', time: 'Yesterday', tag: '脑机接口先锋', desc: '非侵入式脑机接口技术及应用方案提供商...' },
      { name: 'Rokid', time: 'Yesterday', tag: 'AR与人机交互', desc: '致力于将先进的AI与AR技术融入生活与工作...' },
      { name: '宇视科技', time: 'Mon', tag: 'AIoT解决方案', desc: '全球领先的AIoT产品、解决方案与全栈式能力提供商...' }
    ],
    detail: {
      title: '之江实验室智能计算集群',
      avatarLabel: '之',
      sender: '之江实验室研究团队',
      tag: '算力/算法',
      aiSummary: '之江实验室打造的智能计算大科学装置，为人工智能前沿研究提供了算力底座。小镇内的企业在脑机接口、AR交互等领域已产出多项世界级成果。',
      content: [
        '学术界与产业界的同仁：',
        '人工智能小镇致力于打通“基础研究—技术攻关—成果转化”的创新全链条。',
        '我们依托浙江大学、阿里达摩院、之江实验室等顶尖科研力量，重点聚焦人工智能核心算法、专用芯片、智能操作系统等底层技术突破。',
        '在应用层面，智能医疗、自动驾驶、工业视觉等场景已全面开放，为您提供最佳的测试床和试验田。'
      ],
      attachment: 'ai-town-whitepaper.pdf'
    },
    triage: {
      title: '解码智能产业矩阵',
      desc: '从底层算法到具身智能，人工智能小镇涵盖了AI产业链的全图谱，是新质生产力“智”的集中体现。',
      chips: ['大模型', '脑机接口', '具身智能', 'AI芯片'],
      categories: [
        { name: '基础研究与算法', count: '5 机构', desc: '达摩院、之江实验室...', color: '#00d2ff' },
        { name: '智能硬件设备', count: '45 企业', desc: 'Rokid、强脑科技...', color: '#f59e0b' },
        { name: '行业应用解决方案', count: '120 企业', desc: '智慧安防、智能医疗应用...', color: '#A4F4FD' },
        { name: '数据与算力服务', count: '18 企业', desc: '数据标注、超算服务...', color: '#10b981' }
      ]
    },
    logos: ['达摩院', '之江实验室', 'BrainCo', 'Rokid', '宇视科技', '同花顺'],
    testimonials: [
      { quote: '这里的AI浓度极高，走在园区里，你听到的都是关于大模型、具身智能的最前沿探讨。', name: '王博士', role: '算法科学家', company: '某AI独角兽企业' },
      { quote: '从小镇的基础设施到周边高校的人才输送，构建了一个完美的AI创新闭环。', name: '刘总', role: '创始人', company: '智能硬件创业公司' }
    ],
    pricing: {
      watermark1: '智能时代.',
      watermark2: '创新策源',
      cards: [
        { tier: '感知层', title: '视觉与语音', desc: '探索更敏锐的机器感知技术。', features: ['计算机视觉算法', '自然语言处理(NLP)', '多模态交互技术', '传感器数据融合'], btn: '查看感知企业', pro: false },
        { tier: '认知层', title: '大模型与计算', desc: '打造真正具备逻辑推理与创造力的AI大脑。', features: ['百亿级通用大模型', '垂直行业专家模型', '类脑计算架构研究', '强化学习与决策智能', '开源算法社区支持'], btn: '查看核心机构', pro: true, tierColor: 'text-[#3D81E3]' },
        { tier: '执行层', title: '具身智能终端', desc: '让智能进入物理世界，实现虚实结合。', features: ['双足/四足机器人', 'AR/VR 头显设备', '非侵入式脑机接口', '自动驾驶终端'], btn: '查看终端企业', pro: false }
      ]
    },
    finalCta: { title: '与顶尖大脑同行，\n共筑智能未来。', desc: '在人工智能小镇，我们不仅预见未来，我们创造未来。' },
    mapData: {
      markers: [
        { name: '核心研发区', desc: '汇聚国家级实验室与头部企业研发中心，是小镇的大脑。', color: '#00d2ff' },
        { name: '产业化加速区', desc: '帮助AI初创企业将技术转化为成熟的商业产品。', color: '#f59e0b' },
        { name: '智能测试场', desc: '提供自动驾驶、无人机等硬件的实际测试空间。', color: '#A4F4FD' }
      ]
    }
  },
  computing: {
    id: 'computing',
    name: '算力小镇',
    subtitle: '“算”底座',
    description: '算力小镇致力于打造全国领先的算力产业集聚区，提供澎湃的“算”能。为大模型训练、大数据分析提供基础设施。',
    city: 'Hangzhou · Linping',
    mapCoords: { longitude: 120.25, latitude: 30.40 },
    stats: { key: '10+', keyLabel: '数据中心', scale: '500P+', scaleLabel: '智能算力', platform: '2', platformLabel: '算力调度平台' },
    industryLinks: [
      { name: '智能算力 (AI Computing)', color: '#00d2ff' },
      { name: '数据中心 (Data Center)', color: '#A4F4FD' },
      { name: '算力网络 (Computing Network)', color: '#f59e0b' },
      { name: '云服务 (Cloud Services)', color: '#10b981' }
    ],
    companies: [
      { name: '联通产业互联网', time: '14:30 PM', tag: '算网融合主力军', desc: '建设高标准算力中心与算力网络调度枢纽...', active: true },
      { name: '阿里大计算服务', time: '11:00 AM', tag: '云计算基础设施', desc: '提供弹性、高效的云计算与存储能力...' },
      { name: '地平线（杭州）', time: 'Yesterday', tag: '边缘人工智能计算', desc: '研发高效能边缘AI芯片与计算方案...' },
      { name: '算力调度平台', time: 'Yesterday', tag: '公共算力服务', desc: '实现全省乃至长三角跨区域算力资源统筹...' }
    ],
    detail: {
      title: '临平算力中心枢纽',
      avatarLabel: '算',
      sender: '算力调度中心',
      tag: '基建',
      aiSummary: '算力小镇正在构建集“通算、智算、超算”为一体的多样化算力基础设施，通过高速互联网络，为长三角区域的AI企业和科研机构输送源源不断的数据处理能力。',
      content: [
        '各算力需求方：',
        '算力是数字经济时代的水和电，是新质生产力的核心引擎。',
        '算力小镇不仅引进了三大运营商的数据中心项目，更着力打造算力调度交易平台。我们致力于解决“算力孤岛”问题，实现算力资源的弹性分配、随取随用。',
        '无论是大模型训练需要的高并发智算，还是工业仿真需要的超算，在这里都能找到最优解。'
      ],
      attachment: 'computing-power-specs.pdf'
    },
    triage: {
      title: '解构算力产业链',
      desc: '从土建机房到上层云服务，算力小镇覆盖了算力生产、调度到应用的全生命周期。',
      chips: ['智算中心', '算力调度', '绿色数据中心', '边缘计算'],
      categories: [
        { name: '算力基础设施', count: '12 设施', desc: '大型数据中心、智算集群...', color: '#00d2ff' },
        { name: '算力网络与调度', count: '5 平台', desc: '算力交易网、跨域调度系统...', color: '#f59e0b' },
        { name: '云服务与大数据', count: '28 企业', desc: '公有云、私有云解决方案...', color: '#A4F4FD' },
        { name: '算力硬件与芯片', count: '10 企业', desc: 'AI服务器、加速芯片...', color: '#10b981' }
      ]
    },
    logos: ['中国联通', '阿里云', '地平线', '新华三', '安恒信息', '图灵算力'],
    testimonials: [
      { quote: '在大模型时代，算力就是生命线。算力小镇提供了极其稳定且高性价比的智算资源，让我们能够专注于算法迭代。', name: '周总', role: 'AI大模型公司CTO', company: '入驻企业客户' },
      { quote: '这里不仅有硬件，更有算力调度的智慧。将分散的算力整合成一张网，是数字经济的壮举。', name: '李教授', role: '计算机系统结构专家', company: '某高校研究院' }
    ],
    pricing: {
      watermark1: '计算引擎.',
      watermark2: '澎湃动力',
      cards: [
        { tier: '基础', title: '通用算力 (CPU)', desc: '满足常规政企上云、Web服务与基础数据处理需求。', features: ['高可靠性数据中心', '弹性伸缩云服务器', '低延迟网络接入', '24/7 运维保障'], btn: '申请通算资源', pro: false },
        { tier: '进阶', title: '智能算力 (GPU)', desc: '专为深度学习、大模型训练与高性能图形渲染打造。', features: ['顶尖 AI 加速芯片集群', '超高带宽节点间互联', '裸金属服务器独享', '主流深度学习框架预装', '专属技术支持专家'], btn: '申请智算资源', pro: true, tierColor: 'text-[#3D81E3]' },
        { tier: '前沿', title: '超级算力 (HPC)', desc: '面向前沿科学研究、气象分析、航空航天等极端计算挑战。', features: ['千万亿次浮点运算能力', '海量并行存储系统', '定制化计算环境', '国家级重点实验室合作'], btn: '了解超算平台', pro: false }
      ]
    },
    finalCta: { title: '接入算力网络，\n释放无限潜能。', desc: '在这里，获取驱动未来世界运行的底层能量。' },
    mapData: {
      markers: [
        { name: '算力核心机房区', desc: '高标准建设的绿色数据中心群，小镇的“心脏”。', color: '#00d2ff' },
        { name: '算力产业孵化楼', desc: '为云计算、大数据应用企业提供舒适的办公环境。', color: '#f59e0b' },
        { name: '算力调度指挥中心', desc: '实时监控算力使用情况，动态调度全省资源。', color: '#A4F4FD' }
      ]
    }
  },
  deqing: {
    id: 'deqing',
    name: '德清地理信息小镇',
    subtitle: '“空”天眼',
    description: '德清地理信息小镇聚焦“空”天地一体化。汇聚高精地图、卫星导航与遥感企业，是数字孪生和低空经济的先导区。',
    city: 'Huzhou · Deqing',
    mapCoords: { longitude: 119.96, latitude: 30.54 },
    stats: { key: '400+', keyLabel: '地信企业', scale: '1', scaleLabel: '联合国平台', platform: '20+', platformLabel: '北斗应用' },
    industryLinks: [
      { name: '卫星导航与北斗 (GNSS)', color: '#00d2ff' },
      { name: '航空航天遥感 (Remote Sensing)', color: '#A4F4FD' },
      { name: '高精地图与自动驾驶 (HD Map)', color: '#f59e0b' },
      { name: '低空经济 (Low-altitude Economy)', color: '#10b981' }
    ],
    companies: [
      { name: '千寻位置', time: '09:15 AM', tag: '高精度定位服务', desc: '提供厘米级高精度定位与时空智能服务...', active: true },
      { name: '长光卫星', time: 'Yesterday', tag: '商业遥感卫星', desc: '吉林一号卫星星座运营与遥感数据服务...' },
      { name: '极飞科技', time: 'Yesterday', tag: '农业无人机', desc: '利用地理信息与无人机技术赋能智慧农业...' },
      { name: '中海达', time: 'Mon', tag: '测绘与空间信息', desc: '全球领先的高精度测绘仪器与方案提供商...' }
    ],
    detail: {
      title: '联合国地信创新中心',
      avatarLabel: '地',
      sender: '联合国地信中心',
      tag: '国际合作',
      aiSummary: '德清地理信息小镇是联合国全球地理信息知识与创新中心所在地。这里不仅是国内地信产业的高地，更是中国地理信息技术走向全球的窗口。高精定位与低空经济正在这里深度融合。',
      content: [
        '尊敬的关注者：',
        '德清地理信息小镇，从无到有，已崛起为中国地信产业的一张金名片。',
        '我们围绕“空天地”一体化数据获取与应用，构建了从卫星遥感、北斗导航到无人机低空探测的完整产业链。',
        '地理信息是构建数字孪生世界的基础设施，在这里，我们用最精准的坐标，描绘新质生产力的空间蓝图。欢迎来到拥有“国际范”的德清地信小镇。'
      ],
      attachment: 'deqing-gis-report.pdf'
    },
    triage: {
      title: '测绘物理世界',
      desc: '从太空的卫星星座到地面的高精采集车，小镇企业正在以前所未有的精度数字化我们的星球。',
      chips: ['北斗导航', '遥感卫星', '数字孪生', '低空经济'],
      categories: [
        { name: '时空数据获取', count: '85 企业', desc: '卫星制造、无人机探测、测绘仪器...', color: '#00d2ff' },
        { name: '数据处理与平台', count: '150 企业', desc: 'GIS软件、遥感影像处理...', color: '#f59e0b' },
        { name: '高精度定位服务', count: '40 企业', desc: '北斗CORS网建设、位置服务...', color: '#A4F4FD' },
        { name: '行业综合应用', count: '125 企业', desc: '智慧城市、智慧农业、自动驾驶...', color: '#10b981' }
      ]
    },
    logos: ['千寻位置', '长光卫星', '极飞科技', '中海达', '南方测绘', '四维图新'],
    testimonials: [
      { quote: '这里集聚了地理信息行业最全的产业链，足不出镇就能找到所有上下游的合作伙伴，产业协同效率极高。', name: '王总', role: '地信创业者', company: '园区企业' },
      { quote: '联合国地信中心的落户，让德清站在了全球地理信息合作的聚光灯下，为企业出海提供了巨大的背书。', name: '张主任', role: '国际交流专员', company: '研究机构' }
    ],
    pricing: {
      watermark1: '时空坐标.',
      watermark2: '空天地网',
      cards: [
        { tier: '感知', title: '遥感与测绘', desc: '利用先进传感器捕捉地球表面的每一处细节。', features: ['商业遥感卫星数据接收', '高光谱影像处理技术', '激光雷达(LiDAR)扫描', '无人机倾斜摄影测量'], btn: '探索感知能力', pro: false },
        { tier: '定位', title: '北斗与时空智能', desc: '提供厘米级甚至毫米级的绝对位置参考系。', features: ['北斗地基增强系统网', '多源融合室内外定位', '高精地图自动生成平台', '时空大数据分析云引擎', '智能网联车测试场'], btn: '获取定位服务', pro: true, tierColor: 'text-[#3D81E3]' },
        { tier: '赋能', title: '数字孪生应用', desc: '将高精数据转化为千行百业的生产力工具。', features: ['智慧城市CIM底座', '精准农业巡防与植保', '低空空域管理调度系统', '自然灾害动态监测预警'], btn: '查看应用案例', pro: false }
      ]
    },
    finalCta: { title: '以精准尺度，\n丈量无限未来。', desc: '在德清地信小镇，掌握构建数字地球的密码。' },
    mapData: {
      markers: [
        { name: '联合国地信创新中心', desc: '国际交流合作枢纽，小镇的地标性建筑。', color: '#00d2ff' },
        { name: '地信科技孵化园', desc: '集聚大量中小地信创新企业，充满活力。', color: '#f59e0b' },
        { name: '低空飞行测试区', desc: '专门用于无人机及eVTOL的飞行测试与数据采集。', color: '#A4F4FD' }
      ]
    }
  },
  jiashan: {
    id: 'jiashan',
    name: '嘉善归谷智造小镇',
    subtitle: '“融”智慧',
    description: '嘉善归谷聚焦“融”与“智”。作为海归人才创业高地，小镇将前沿算法与高端制造深度融合，打造智能终端与生命健康产业。',
    city: 'Jiaxing · Jiashan',
    mapCoords: { longitude: 120.92, latitude: 30.84 },
    stats: { key: '200+', keyLabel: '海归人才', scale: '150+', scaleLabel: '智造企业', platform: '4', platformLabel: '跨国转化中心' },
    industryLinks: [
      { name: '智能终端 (Smart Terminals)', color: '#00d2ff' },
      { name: '生命健康 (Life Sciences)', color: '#A4F4FD' },
      { name: '高端装备制造 (Advanced Mfg)', color: '#f59e0b' },
      { name: '传感器网络 (Sensor Networks)', color: '#10b981' }
    ],
    companies: [
      { name: '立讯智造', time: '16:05 PM', tag: '智能可穿戴先锋', desc: '高端智能手表及无线穿戴设备的研发与制造...', active: true },
      { name: '格科微电子', time: 'Yesterday', tag: 'CMOS与显示芯片', desc: '聚焦图像传感器及显示驱动芯片的封装测试...' },
      { name: '赋同量子', time: 'Yesterday', tag: '量子科技与仪器', desc: '致力于超导量子计算及高端科研仪器研发...' },
      { name: '景嘉微电子', time: 'Mon', tag: '图形处理芯片(GPU)', desc: '国产高性能GPU研发与产业化基地...' }
    ],
    detail: {
      title: '归谷海归创业中心',
      avatarLabel: '归',
      sender: '归谷小镇服务办',
      tag: '人才/智造',
      aiSummary: '嘉善归谷小镇以“海归人才”为核心资源，深度融合长三角一体化优势。重点发展以智能传感器、智能网联汽车部件为代表的“智造”产业，是长三角新质生产力技术转化的重要节点。',
      content: [
        '海外学子与创业精英：',
        '“归心似箭，智汇硅谷”——这是嘉善归谷智造小镇的名字由来。',
        '地处长三角生态绿色一体化发展示范区，归谷小镇拥有得天独厚的区位优势。我们致力于将海外顶尖的科技成果，在这里与中国强大的供应链制造能力深度“融合”。',
        '无论是智能终端、医疗器械，还是量子科技，归谷为您提供从实验室到量产的全链条支持。欢迎归家，共创智造未来。'
      ],
      attachment: 'jiashan-guigu-policy.pdf'
    },
    triage: {
      title: '融合创新的转化场',
      desc: '打破科研与制造的壁垒，让最前沿的图纸在这里迅速落地成为高质量的产品。',
      chips: ['海归创业', '长三角一体化', '智能传感', '生命健康'],
      categories: [
        { name: '智能终端与装备', count: '65 企业', desc: '可穿戴设备、智能机器人...', color: '#00d2ff' },
        { name: '半导体与传感器', count: '42 企业', desc: '芯片封测、MEMS传感器...', color: '#f59e0b' },
        { name: '生命健康器械', count: '30 企业', desc: '高端医疗器械、体外诊断...', color: '#A4F4FD' },
        { name: '前沿交叉科技', count: '15 企业', desc: '量子仪器、新材料应用...', color: '#10b981' }
      ]
    },
    logos: ['立讯智造', '格科微', '赋同量子', '景嘉微', '博升光电', '云顶新耀'],
    testimonials: [
      { quote: '归谷的区位太棒了，半小时通勤圈覆盖了上海、杭州、苏州。这对于我们在长三角调度供应链至关重要。', name: 'Dr. Zhang', role: '海归创业者', company: '智能医疗企业' },
      { quote: '小镇不仅有高端的研发楼，后方就紧连着现代化的无尘厂房。这种研发制造一体化的园区设计极大地缩短了产品上市时间。', name: '刘厂长', role: '生产负责人', company: '消费电子大厂' }
    ],
    pricing: {
      watermark1: '归谷智造.',
      watermark2: '融合创新',
      cards: [
        { tier: '起航', title: '海归孵化专区', desc: '专为海外高层次人才归国创业量身打造的软硬件环境。', features: ['一站式人才落户服务', '海外学历快速认证通道', '精装研发实验场地', '早期天使基金对接'], btn: '查看人才政策', pro: false },
        { tier: '落地', title: '智能终端中试', desc: '打通从研发原型到批量生产的关键“最后一公里”。', features: ['高标准百级无尘车间', '共享精密加工与检测设备', '长三角核心供应链对接', '全流程质量体系辅导', '自动化产线设计咨询'], btn: '申请中试车间', pro: true, tierColor: 'text-[#3D81E3]' },
        { tier: '扩张', title: '规模化智造', desc: '为成熟期的高端制造企业提供广阔的产业空间。', features: ['大面积工业用地指标', '智能微电网与能源保障', '保税物流通道便利', '龙头企业生态集群效应'], btn: '对接产业供地', pro: false }
      ]
    },
    finalCta: { title: '归聚英才，\n智造长三角。', desc: '在归谷，见证前沿科技与中国制造力量的完美融合。' },
    mapData: {
      markers: [
        { name: '归谷科创大厦', desc: '研发总部基地，海归人才的首要落脚点。', color: '#00d2ff' },
        { name: '智能终端制造示范区', desc: '高度自动化的黑灯工厂聚集区，展示现代制造之美。', color: '#f59e0b' },
        { name: '生命健康加速器', desc: '配备专业医疗器械检测设备的生医企业专区。', color: '#A4F4FD' }
      ]
    }
  }
};
