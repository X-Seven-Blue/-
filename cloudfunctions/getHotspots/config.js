module.exports = {
  version: '1.0.0',
  updatedAt: '2026-06-03',
  hotspots: [
    {
      id: 'cat',
      name: '小猫',
      x: 0.36,
      y: 0.58,
      width: 0.28,
      height: 0.24,
      targetPage: 'cat-interaction',
      enabled: true,
      sort: 1,
      desc: '点击小猫进行互动'
    },
    {
      id: 'desk',
      name: '书桌',
      x: 0.08,
      y: 0.50,
      width: 0.28,
      height: 0.22,
      targetPage: 'study',
      enabled: true,
      sort: 2,
      desc: '进入学习入口'
    },
    {
      id: 'window',
      name: '窗户',
      x: 0.62,
      y: 0.22,
      width: 0.28,
      height: 0.20,
      targetPage: 'community',
      enabled: true,
      sort: 3,
      desc: '查看社区内容'
    },
    {
      id: 'wardrobe',
      name: '衣柜',
      x: 0.72,
      y: 0.50,
      width: 0.22,
      height: 0.28,
      targetPage: 'outfit',
      enabled: true,
      sort: 4,
      desc: '进入换装'
    },
    {
      id: 'vault',
      name: '小金库',
      x: 0.12,
      y: 0.76,
      width: 0.22,
      height: 0.16,
      targetPage: 'growth',
      enabled: true,
      sort: 5,
      desc: '成长金入口，仅用于页面跳转配置'
    }
  ]
}
