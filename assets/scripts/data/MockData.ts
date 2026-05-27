import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';

export const PET_MESSAGES = [
  '阿橘蹭了蹭你的手～',
  '呼噜呼噜，今天也要加油呀',
  '再摸一下要收罐头啦～',
];

export const TRADE_DISCLAIMER = '本场景仅用于理财知识学习与模拟体验，不构成任何投资建议，不代表真实收益。';

export const GROWTH_COMPLIANCE_LINES = [
  '平台不触碰用户资金',
  '不展示真实资金余额',
  '不承诺收益',
  '不构成投资建议',
  'Demo 不包含真实支付或金融接口',
];

export const DEFAULT_STATE: GameState = {
  user: {
    nickname: '种猫新手',
    cans: 128,
    intimacy: 36,
    degree: '喵喵生预备役',
    growthLimit: 10000,
    catCount: 1,
    studyDays: 7,
    studyCompletedCount: 0,
    seedPlanted: false,
  },
  cats: [
    { id: 'orange', name: '阿橘', breed: '橘猫', mbti: 'ENFJ', personality: '暖心大姐姐', unlocked: true },
    { id: 'ragdoll', name: '小布', breed: '布偶猫', mbti: 'INFP', personality: '文艺少女', unlocked: false },
    { id: 'blue', name: '蓝教授', breed: '蓝猫', mbti: 'INTJ', personality: '理性学霸', unlocked: false },
    { id: 'american', name: '甜甜', breed: '美短', mbti: 'ESFP', personality: '元气甜妹', unlocked: false },
  ],
  courses: [
    { id: 'money-001', title: '什么是货币基金？', category: '观鱼塘', duration: 45, reward: 1, progress: 0, desc: '了解低风险现金管理工具。' },
    { id: 'money-002', title: '为什么要记账？', category: '观鱼塘', duration: 30, reward: 1, progress: 0, desc: '看见钱去哪了，是变富第一步。' },
    { id: 'money-003', title: 'ETF 是什么？', category: '蜻蜓书院', duration: 50, reward: 1, progress: 0, desc: '认识指数化投资工具。' },
    { id: 'money-004', title: '复利为什么厉害？', category: '蜻蜓书院', duration: 55, reward: 1, progress: 0, desc: '理解时间和收益的朋友关系。' },
    { id: 'money-005', title: '如何看懂风险等级？', category: '锦毛学馆', duration: 40, reward: 1, progress: 0, desc: '风险不是吓人，是帮助选择。' },
    { id: 'money-006', title: '什么是资产配置？', category: '弄墨斋', duration: 60, reward: 1, progress: 0, desc: '不要把所有罐头放进一个篮子。' },
  ],
  tradeItems: [
    { id: 'beauty', name: '美妆 ETF', price: 1.23, changePercent: 1.2, riskLevel: '中', desc: '模拟行业主题，不构成投资建议。' },
    { id: 'consume', name: '消费 ETF', price: 2.01, changePercent: -0.4, riskLevel: '中', desc: '模拟消费主题，不构成投资建议。' },
    { id: 'tech', name: '科技 ETF', price: 3.45, changePercent: 2.1, riskLevel: '中高', desc: '模拟科技主题，不构成投资建议。' },
    { id: 'power', name: '电力 ETF', price: 1.78, changePercent: 0.6, riskLevel: '中', desc: '模拟电力主题，不构成投资建议。' },
    { id: 'broad', name: '宽基 ETF', price: 4.56, changePercent: 0.3, riskLevel: '中低', desc: '模拟宽基主题，不构成投资建议。' },
  ],
  achievements: [
    { id: 'first_touch', name: '第一次摸猫', desc: '第一次和阿橘互动。', unlocked: false },
    { id: 'first_feed', name: '第一口罐头', desc: '第一次喂阿橘罐头。', unlocked: false },
    { id: 'first_course', name: '完成第一节课', desc: '完成任意一节理财小课。', unlocked: false },
    { id: 'first_trade', name: '模拟交易初体验', desc: '完成一次实验田模拟。', unlocked: false },
    { id: 'seven_days', name: '连续学习 7 天', desc: '学习是一件慢慢来的事。', unlocked: true },
    { id: 'degree_miao', name: '解锁喵喵生', desc: '获得喵喵生学位。', unlocked: false },
    { id: 'can_collector', name: '猫罐头收藏家', desc: '累计拥有很多罐头。', unlocked: false },
    { id: 'long_term', name: '温柔长期主义者', desc: '慢慢来，比较快。', unlocked: false },
  ],
};

export const __cocosTypeAnchor = { _decorator, Component, Node };
