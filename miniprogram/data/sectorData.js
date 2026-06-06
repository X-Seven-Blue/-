const sectors = [
  {
    id: 'beauty',
    name: '美妆',
    icon: '💄',
    desc: '探索美丽经济，把握颜值消费新趋势',
    keywords: ['消费升级', '品牌出海', '颜值经济'],
    catQuestion: '如果只能研究一个行业，你会把时间花在哪里？',
    catTip: '美妆行业聚焦女性消费升级，长期成长空间广阔喵～'
  },
  {
    id: 'digital',
    name: '数码产品',
    icon: '📱',
    desc: '聚焦科技创新，挖掘智能硬件增长机会',
    keywords: ['智能硬件', '消费电子', '新品周期'],
    catQuestion: '想从每天使用的设备里，看见产业变化吗？',
    catTip: '数码产品赛道跟随创新周期，适合观察需求和技术一起跳动。'
  },
  {
    id: 'robot',
    name: '机器人',
    icon: '🤖',
    desc: '拥抱智能制造，布局机器人未来赛道',
    keywords: ['智能制造', '自动化', '产业升级'],
    catQuestion: '如果机器能帮人完成更多工作，你想研究哪一环？',
    catTip: '机器人赛道连接制造与服务，耐心研究会发现许多细分机会。'
  },
  {
    id: 'ai',
    name: 'AI',
    icon: '🧠',
    desc: '洞察人工智能浪潮，捕捉技术变革红利',
    keywords: ['算力', '模型应用', '产业智能化'],
    catQuestion: '当 AI 改变工具和效率，你最想追踪什么？',
    catTip: 'AI 赛道变化快，先看产业落地，再看长期价值。'
  },
  {
    id: 'food',
    name: '食品',
    icon: '🥛',
    desc: '关注民生消费，把握食品饮料投资机会',
    keywords: ['必选消费', '渠道升级', '品牌力'],
    catQuestion: '从餐桌和零食架里，也能读懂消费趋势吗？',
    catTip: '食品赛道贴近日常生活，需求韧性是研究重点。'
  },
  {
    id: 'liquor',
    name: '白酒',
    icon: '🍶',
    desc: '探寻传统佳酿，品味中国白酒投资价值',
    keywords: ['高端消费', '品牌壁垒', '库存周期'],
    catQuestion: '想研究一个兼具文化和商业的传统行业吗？',
    catTip: '白酒赛道适合观察品牌、渠道和消费场景的长期变化。'
  },
  {
    id: 'medical',
    name: '医疗',
    icon: '🩺',
    desc: '深耕健康产业，把握医疗创新与需求增长',
    keywords: ['创新药', '医疗器械', '老龄化'],
    catQuestion: '健康需求越来越重要，你想从哪里开始研究？',
    catTip: '医疗赛道专业度高，可以从需求确定性和创新节奏入手。'
  }
];

function getSectorById(id) {
  return sectors.find((sector) => sector.id === id) || sectors[0];
}

module.exports = {
  sectors,
  getSectorById
};
