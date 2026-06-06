const { sectors } = require('../../data/sectorData');

Page({
  data: {
    resources: [
      { icon: '🌱', value: 1280 },
      { icon: '☘️', value: 36 },
      { icon: '🐟', value: 5 }
    ],
    sectors,
    selectedSectorId: sectors[0].id,
    selectedSector: sectors[0]
  },

  onLoad(options) {
    if (options.forceSelect === '1') {
      this.setInitialSelection();
      return;
    }

    const storedSectorId = wx.getStorageSync('selectedSectorId');
    if (storedSectorId) {
      wx.redirectTo({
        url: `/pages/trade/trade?sectorId=${storedSectorId}`
      });
      return;
    }

    this.setInitialSelection();
  },

  setInitialSelection() {
    const selectedSector = sectors[0];
    this.setData({
      selectedSectorId: selectedSector.id,
      selectedSector
    });
  },

  selectSector(e) {
    const sectorId = e.currentTarget.dataset.id;
    const selectedSector = sectors.find((sector) => sector.id === sectorId) || sectors[0];

    this.setData({
      selectedSectorId: selectedSector.id,
      selectedSector
    });
  },

  randomSector() {
    if (sectors.length <= 1) {
      return;
    }

    const currentIndex = sectors.findIndex((sector) => sector.id === this.data.selectedSectorId);
    let nextIndex = Math.floor(Math.random() * sectors.length);
    if (nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1) % sectors.length;
    }

    const selectedSector = sectors[nextIndex];
    this.setData({
      selectedSectorId: selectedSector.id,
      selectedSector
    });
  },

  startResearch() {
    const sectorId = this.data.selectedSectorId || sectors[0].id;
    wx.setStorageSync('selectedSectorId', sectorId);
    wx.redirectTo({
      url: `/pages/trade/trade?sectorId=${sectorId}`
    });
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({ url: '/pages/house/house' });
  }
});
