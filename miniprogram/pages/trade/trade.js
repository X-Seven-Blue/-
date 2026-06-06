const { sectors, getSectorById } = require('../../data/sectorData');
const { buildSectorEtfData } = require('../../data/etfMockData');

Page({
  data: {
    resources: [
      { icon: '🌱', value: 1280 },
      { icon: '☘️', value: 36 },
      { icon: '🐟', value: 5 }
    ],
    sectors,
    tabs: ['指数', 'ETF基金', '场外基金'],
    activeTab: '指数',
    sector: null,
    overview: null,
    lists: {},
    displayItems: []
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
    const activeTab = '指数';

    wx.setStorageSync('selectedSectorId', sector.id);
    this.setData({
      sector,
      overview: etfData.overview,
      lists: etfData.lists,
      activeTab,
      displayItems: etfData.lists[activeTab]
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
    const itemId = e.currentTarget.dataset.id;
    const lists = Object.assign({}, this.data.lists);

    Object.keys(lists).forEach((tab) => {
      lists[tab] = lists[tab].map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        return Object.assign({}, item, { followed: !item.followed });
      });
    });

    this.setData({
      lists,
      displayItems: lists[this.data.activeTab] || []
    });
  },

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab,
      displayItems: this.data.lists[activeTab] || []
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
