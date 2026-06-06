const trendA = [24, 32, 28, 40, 36, 48, 44, 58, 52, 66, 74];
const trendB = [20, 26, 34, 30, 42, 38, 52, 49, 61, 57, 70];
const trendC = [18, 24, 22, 35, 31, 44, 39, 53, 48, 60, 68];

const sectorRows = {
  beauty: {
    overview: ['+24.35%', '78.5', '45.2%', ['消费升级', '品牌出海', '颜值经济']],
    index: [
      ['中证女性消费指数', '931594', '6,789.45', '+1.82%', '6只', trendA],
      ['中证内地颜值经济指数', '931612', '4,512.38', '+1.35%', '4只', trendB],
      ['国证美妆指数', '980032', '6,234.17', '+1.15%', '3只', trendC],
      ['中证新消费指数', '931598', '3,876.91', '+0.98%', '8只', trendA]
    ],
    etf: [
      ['华安中证细分美妆产业ETF', '159636', '1.3245', '+1.28%', '关注', trendA, true],
      ['国泰中证港股通美妆ETF', '513120', '0.9872', '+0.95%', '关注', trendB, false],
      ['银华中证美妆ETF', '159983', '1.1058', '+1.15%', '关注', trendC, false]
    ],
    offMarket: [
      ['华夏美妆产业联接A', '018236', '1.1082', '+0.82%', '自选', trendA, false],
      ['广发颜值经济精选A', '017319', '0.9821', '+0.64%', '自选', trendB, false]
    ]
  },
  digital: {
    overview: ['+18.62%', '72.4', '51.8%', ['智能硬件', '新品周期', '换机需求']],
    index: [
      ['中证消费电子指数', '931494', '5,216.84', '+1.12%', '7只', trendB],
      ['国证智能硬件指数', '980088', '4,703.16', '+0.94%', '5只', trendA],
      ['中证科技消费指数', '931689', '3,925.77', '+0.76%', '3只', trendC]
    ],
    etf: [
      ['易方达中证消费电子ETF', '562950', '1.1842', '+1.06%', '关注', trendB, true],
      ['华夏中证数码产品ETF', '159732', '0.9348', '+0.74%', '关注', trendC, false]
    ],
    offMarket: [
      ['南方消费电子联接A', '012345', '1.0218', '+0.61%', '自选', trendA, false]
    ]
  },
  robot: {
    overview: ['+31.08%', '84.6', '58.3%', ['智能制造', '自动化', '工业升级']],
    index: [
      ['中证机器人指数', '931895', '7,203.44', '+2.05%', '9只', trendA],
      ['国证机器人产业指数', '980070', '5,882.10', '+1.62%', '6只', trendB],
      ['中证智能制造指数', '930850', '4,726.38', '+1.18%', '8只', trendC]
    ],
    etf: [
      ['华宝中证机器人ETF', '562500', '1.2167', '+1.42%', '关注', trendA, true],
      ['南方中证机器人产业ETF', '159770', '1.0086', '+0.88%', '关注', trendB, false]
    ],
    offMarket: [
      ['富国智能制造联接A', '014226', '0.9735', '+0.57%', '自选', trendC, false]
    ]
  },
  ai: {
    overview: ['+42.16%', '91.2', '63.7%', ['算力扩张', '模型应用', '产业智能化']],
    index: [
      ['中证人工智能指数', '930713', '8,916.50', '+2.46%', '12只', trendA],
      ['中证云计算指数', '930851', '6,275.24', '+1.89%', '8只', trendB],
      ['国证AI应用指数', '980118', '4,884.62', '+1.58%', '5只', trendC]
    ],
    etf: [
      ['招商中证人工智能ETF', '159819', '1.4369', '+1.76%', '关注', trendA, true],
      ['鹏华中证云计算AI ETF', '159739', '1.1724', '+1.22%', '关注', trendB, false]
    ],
    offMarket: [
      ['广发人工智能联接A', '011530', '1.0915', '+0.98%', '自选', trendC, false]
    ]
  },
  food: {
    overview: ['+12.74%', '66.9', '39.5%', ['必选消费', '品牌力', '渠道升级']],
    index: [
      ['中证食品饮料指数', '930653', '7,445.61', '+0.82%', '10只', trendB],
      ['国证民生消费指数', '980018', '4,328.92', '+0.55%', '5只', trendC],
      ['中证品牌消费指数', '931165', '5,012.76', '+0.49%', '6只', trendA]
    ],
    etf: [
      ['汇添富中证食品饮料ETF', '515170', '1.2788', '+0.66%', '关注', trendB, true],
      ['华夏中证食品ETF', '159862', '1.0136', '+0.41%', '关注', trendC, false]
    ],
    offMarket: [
      ['银华民生消费联接A', '012552', '0.9963', '+0.35%', '自选', trendA, false]
    ]
  },
  liquor: {
    overview: ['+8.91%', '61.8', '34.6%', ['高端消费', '品牌壁垒', '库存周期']],
    index: [
      ['中证白酒指数', '399997', '6,120.38', '+0.58%', '8只', trendC],
      ['国证酒类指数', '980015', '4,891.75', '+0.47%', '5只', trendB],
      ['中证高端消费指数', '931020', '5,426.19', '+0.39%', '6只', trendA]
    ],
    etf: [
      ['鹏华中证酒ETF', '512690', '0.8916', '+0.52%', '关注', trendC, true],
      ['招商中证白酒ETF', '161725', '1.1542', '+0.47%', '关注', trendB, false]
    ],
    offMarket: [
      ['华宝酒类消费联接A', '012548', '0.9627', '+0.29%', '自选', trendA, false]
    ]
  },
  medical: {
    overview: ['+15.47%', '70.3', '42.1%', ['创新药', '医疗器械', '健康需求']],
    index: [
      ['中证医疗指数', '399989', '5,704.33', '+1.06%', '11只', trendA],
      ['中证创新药指数', '931152', '3,892.64', '+1.18%', '7只', trendB],
      ['国证医疗器械指数', '980086', '4,221.70', '+0.92%', '4只', trendC]
    ],
    etf: [
      ['华夏中证医疗ETF', '512170', '0.8645', '+0.73%', '关注', trendA, true],
      ['易方达创新药ETF', '516080', '0.9322', '+0.91%', '关注', trendB, false]
    ],
    offMarket: [
      ['嘉实医疗器械联接A', '013415', '1.0477', '+0.84%', '自选', trendC, false]
    ]
  }
};

function toListItem(row, prefix, index) {
  return {
    id: `${prefix}-${index + 1}`,
    name: row[0],
    code: row[1],
    latest: row[2],
    changePercent: row[3],
    actionText: row[4],
    trend: row[5],
    followed: Boolean(row[6])
  };
}

function buildSectorEtfData(sector) {
  const row = sectorRows[sector.id] || sectorRows.beauty;
  const overview = row.overview;

  return {
    sectorId: sector.id,
    sectorName: sector.name,
    overview: {
      oneYearChange: overview[0],
      heat: overview[1],
      valuationPercentile: overview[2],
      keywords: overview[3]
    },
    lists: {
      指数: row.index.map((item, index) => toListItem(item, `${sector.id}-index`, index)),
      ETF基金: row.etf.map((item, index) => toListItem(item, `${sector.id}-etf`, index)),
      场外基金: row.offMarket.map((item, index) => toListItem(item, `${sector.id}-off`, index))
    }
  };
}

module.exports = {
  buildSectorEtfData
};
