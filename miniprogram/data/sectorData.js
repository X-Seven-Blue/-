const sectors = [
  {
    id: 'beauty',
    name: '美妆',
    marketName: '女性消费',
    icon: '💄',
    visualIcon: '💋',
    art: '/assets/learn/icon-beauty.png',
    desc: '探索美丽经济，把握颜值消费新趋势',
    keywords: ['消费升级', '品牌出海', '颜值经济'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 美妆 子类\n进入 女性消费 赛道，\n把握颜值经济的增长机会',
    tradeFocus: '聚焦女性消费升级，',
    tradeOpportunity: '把握颜值经济的增长机会',
    prosperity: '高景气',
    prosperityHint: '较上月升温',
    featurePoints: ['居民可支配收入提升', '悦己消费驱动增长', '国货品牌崛起出海', '线上渠道持续扩张']
  },
  {
    id: 'digital',
    name: '数码产品',
    icon: '📱',
    visualIcon: '⌚',
    art: '/assets/learn/icon-digital.png',
    desc: '聚焦科技创新，挖掘智能硬件增长机会',
    keywords: ['智能硬件', '消费电子', '新品周期'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 数码产品 赛道\n观察智能硬件换新周期，\n寻找科技消费的成长机会',
    tradeFocus: '观察智能硬件换新周期，',
    tradeOpportunity: '寻找科技消费的成长机会',
    prosperity: '稳步回暖',
    prosperityHint: '需求修复中',
    featurePoints: ['新品发布带动关注', 'AI 终端加速渗透', '供应链效率改善', '高端产品结构升级']
  },
  {
    id: 'robot',
    name: '机器人',
    icon: '🤖',
    visualIcon: '🦾',
    art: '/assets/learn/icon-robot.png',
    desc: '拥抱智能制造，布局机器人未来赛道',
    keywords: ['智能制造', '自动化', '产业升级'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 机器人 赛道\n聚焦自动化和智能制造，\n寻找产业升级的长期机会',
    tradeFocus: '聚焦自动化和智能制造，',
    tradeOpportunity: '寻找产业升级的长期机会',
    prosperity: '高成长',
    prosperityHint: '热度升温',
    featurePoints: ['制造业自动化提升', '人形机器人催化', '核心零部件国产化', '应用场景持续拓展']
  },
  {
    id: 'ai',
    name: 'AI',
    icon: '🧠',
    visualIcon: '💠',
    art: '/assets/learn/icon-ai.png',
    desc: '洞察人工智能浪潮，捕捉技术变革红利',
    keywords: ['算力', '模型应用', '产业智能化'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 AI 赛道\n跟踪算力与应用落地，\n捕捉技术变革的结构机会',
    tradeFocus: '跟踪算力与应用落地，',
    tradeOpportunity: '捕捉技术变革的结构机会',
    prosperity: '强景气',
    prosperityHint: '资金关注高',
    featurePoints: ['算力需求持续扩张', '模型应用加速落地', '企业智能化投入增加', '产业链分工更清晰']
  },
  {
    id: 'food',
    name: '食品',
    icon: '🥛',
    visualIcon: '🍪',
    art: '/assets/learn/icon-food.png',
    desc: '关注民生消费，把握食品饮料投资机会',
    keywords: ['必选消费', '渠道升级', '品牌力'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 食品 赛道\n关注日常消费韧性，\n把握品牌和渠道的稳定增长',
    tradeFocus: '关注日常消费韧性，',
    tradeOpportunity: '把握品牌和渠道的稳定增长',
    prosperity: '稳健景气',
    prosperityHint: '需求稳定',
    featurePoints: ['刚需消费韧性较强', '品牌集中度提升', '渠道效率继续改善', '健康化趋势增强']
  },
  {
    id: 'liquor',
    name: '白酒',
    icon: '🍶',
    visualIcon: '🥃',
    art: '/assets/learn/icon-liquor.png',
    desc: '探寻传统佳酿，品味中国白酒投资价值',
    keywords: ['高端消费', '品牌壁垒', '库存周期'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 白酒 赛道\n观察品牌壁垒和库存周期，\n品味传统消费的长期价值',
    tradeFocus: '观察品牌壁垒和库存周期，',
    tradeOpportunity: '品味传统消费的长期价值',
    prosperity: '温和修复',
    prosperityHint: '等待催化',
    featurePoints: ['高端品牌壁垒较强', '宴席场景逐步恢复', '渠道库存需要观察', '现金流质量受关注']
  },
  {
    id: 'medical',
    name: '医疗',
    icon: '🩺',
    visualIcon: '💊',
    art: '/assets/learn/icon-medical.png',
    desc: '深耕健康产业，把握医疗创新与需求增长',
    keywords: ['创新药', '医疗器械', '老龄化'],
    catQuestion: '如果只能研究一个行业，\n你会把时间花在哪里？',
    catTip: '你已选择 医疗 赛道\n深耕健康需求和创新周期，\n寻找长期确定性的成长机会',
    tradeFocus: '深耕健康需求和创新周期，',
    tradeOpportunity: '寻找长期确定性的成长机会',
    prosperity: '修复向上',
    prosperityHint: '创新驱动',
    featurePoints: ['老龄化需求明确', '创新药研发推进', '医疗器械国产替代', '政策预期逐步明朗']
  }
];

function getSectorById(id) {
  return sectors.find((sector) => sector.id === id) || sectors[0];
}

module.exports = {
  sectors,
  getSectorById
};
