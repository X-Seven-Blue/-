const { getSectorById } = require('../../data/sectorData');
const { buildSectorEtfData } = require('../../data/etfMockData');

Page({
  data: {
    resources: [
      { icon: '🌱', value: 1280 },
      { icon: '☘️', value: 36 },
      { icon: '🐟', value: 5 }
    ],
    tabs: ['ETF基金', '场外基金', '指数'],
    activeTab: 'ETF基金',
    sector: null,
    overview: null,
    funds: []
  },

  onLoad(options) {
    const sectorId = options.sectorId || wx.getStorageSync('selectedSectorId');
    if (!sectorId) {
      wx.redirectTo({ url: '/pages/learn/learn' });
      return;
    }

    this.loadSectorData(sectorId);
  },

  loadSectorData(sectorId) {
    const sector = getSectorById(sectorId);
    const etfData = buildSectorEtfData(sector);

    wx.setStorageSync('selectedSectorId', sector.id);
    this.setData({
      sector,
      overview: etfData.overview,
      funds: etfData.funds,
      activeTab: 'ETF基金'
    });
  },

  handleSwitchSector() {
    wx.showModal({
      title: '切换赛道？',
      content: '专心研究一个赛道会好过泛泛地研究多个赛道，你确定要选择别的赛道吗？',
      confirmText: '重新选择',
      cancelText: '继续研究',
      success(res) {
        if (res.confirm) {
          wx.redirectTo({
            url: '/pages/learn/learn?forceSelect=1'
          });
        }
      }
    });
  },

  toggleFollow(e) {
    const fundId = e.currentTarget.dataset.id;
    const funds = this.data.funds.map((fund) => {
      if (fund.id !== fundId) {
        return fund;
      }

      return Object.assign({}, fund, { followed: !fund.followed });
    });

    this.setData({ funds });
  },

  switchTab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab
    });
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({ url: '/pages/learn/learn?forceSelect=1' });
  }
});
