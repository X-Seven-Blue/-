const { sectors, getSectorById } = require('../../data/sectorData');
const { buildSectorEtfData } = require('../../data/etfMockData');

const TAB_META = {
  全部: {
    nameTitle: '基金名称',
    valueTitle: '净值/涨跌幅',
    actionTitle: '操作',
    moreText: '查看更多标的'
  },
  指数: {
    nameTitle: '指数名称',
    valueTitle: '最新价',
    actionTitle: '跟踪基金',
    moreText: '查看更多指数'
  },
  ETF: {
    nameTitle: '基金名称',
    valueTitle: '最新净值',
    actionTitle: '操作',
    moreText: '查看更多ETF'
  },
  场外基金: {
    nameTitle: '基金名称',
    valueTitle: '最新净值',
    actionTitle: '操作',
    moreText: '查看更多场外基金'
  }
};

const RESEARCH_TABS = ['指数', 'ETF', '场外基金'];
const FUND_TABS = ['全部', 'ETF', '场外基金', '指数'];

Page({
  data: {
    resources: [
      { icon: '🌱', value: 1280 },
      { icon: '☘️', value: 36 },
      { icon: '🐟', value: 5 }
    ],
    sectors,
    tabs: RESEARCH_TABS,
    activeTab: '指数',
    tradeView: 'research',
    chartPeriods: ['1D', '1W', '1M', '3M', '1Y', '5Y'],
    activePeriod: '1D',
    activeCategoryIndex: 0,
    selectedFilterText: '综合排序',
    displaySectors: [],
    categoryChips: [],
    listNameTitle: TAB_META.指数.nameTitle,
    listValueTitle: TAB_META.指数.valueTitle,
    listActionTitle: TAB_META.指数.actionTitle,
    listMoreText: TAB_META.指数.moreText,
    sector: null,
    overview: null,
    lists: {},
    displayItems: [],
    cartItems: [],
    cartCount: 0,
    selectedFund: null,
    returnView: 'research',
    purchaseAmount: '100,000.00',
    availableAmount: '100,000.00',
    allocationMode: '等额买入',
    advisors: [
      {
        agentId: 'valuation-cat',
        endpointKey: 'advisorAgentEndpoint',
        avatar: '/assets/trade/advisor-munger-demo.jpg',
        name: '芒格喵',
        role: '估值理性派',
        vote: '可以分批买入',
        rationale: '价格不算贵，可以慢慢持有',
        confidence: 86,
        status: 'mock'
      },
      {
        agentId: 'trend-cat',
        endpointKey: 'advisorAgentEndpoint',
        avatar: '/assets/trade/advisor-buffett-demo.jpg',
        name: '巴菲特喵',
        role: '护城河派',
        vote: '长期持有更佳',
        rationale: '行业空间还在，未来可期',
        confidence: 91,
        status: 'mock'
      },
      {
        agentId: 'growth-cat',
        endpointKey: 'advisorAgentEndpoint',
        avatar: '/assets/trade/advisor-fisher-demo.jpg',
        name: '费雪喵',
        role: '成长空间派',
        vote: '赞成买入',
        rationale: '成长确定性较强',
        confidence: 88,
        status: 'mock'
      },
      {
        agentId: 'risk-cat',
        endpointKey: 'advisorAgentEndpoint',
        avatar: '/assets/trade/advisor-dalio-demo.jpg',
        name: '达利欧喵',
        role: '风控仓位派',
        vote: '控制仓位',
        rationale: '短期波动难免，注意回撤',
        confidence: 74,
        status: 'mock'
      }
    ],
    advisorSummary: '顾问团建议：可以分批买入，长期持有更佳',
    activeAdvisorIndex: 0,
    activeAdvisor: null,
    orderTime: ''
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
    const rawSector = getSectorById(sectorId);
    const marketName = rawSector.marketName || rawSector.name;
    const isSubSector = marketName !== rawSector.name;
    const sector = Object.assign({}, rawSector, {
      marketName,
      isSubSector,
      entryCopy: isSubSector
        ? `${rawSector.name}是便于理解的子类入口`
        : `${rawSector.name}就是当前研究赛道入口`
    });
    const etfData = buildSectorEtfData(sector);
    const activeTab = '指数';
    const activeAdvisor = this.data.advisors[this.data.activeAdvisorIndex] || this.data.advisors[0];

    wx.setStorageSync('selectedSectorId', sector.id);
    this.setData({
      sector,
      displaySectors: this.buildDisplaySectors(sector),
      categoryChips: this.buildCategoryChips(sector),
      overview: etfData.overview,
      lists: etfData.lists,
      activeTab,
      tabs: RESEARCH_TABS,
      tradeView: 'research',
      selectedFund: null,
      activeCategoryIndex: 0,
      selectedFilterText: '综合排序',
      activeAdvisor,
      displayItems: this.buildDisplayItems(this.getTabItems(etfData.lists, activeTab), activeTab)
    }, () => {
      this.applyTabMeta(activeTab);
      this.syncCartItems(etfData.lists);
    });
  },

  buildDisplaySectors(currentSector) {
    const fallbackId = currentSector.id === 'robot' ? 'beauty' : 'robot';
    const preferredIds = [currentSector.id, fallbackId];
    const uniqueIds = preferredIds.filter((id, index) => preferredIds.indexOf(id) === index);
    return uniqueIds
      .map((id) => getSectorById(id))
      .filter(Boolean)
      .map((sector) => Object.assign({}, sector, { marketName: sector.marketName || sector.name }))
      .slice(0, 2);
  },

  buildCategoryChips(sector) {
    const categoryMap = {
      beauty: [
        { icon: '💄', name: '美妆' },
        { icon: '🧴', name: '个护' },
        { icon: '👕', name: '服饰' },
        { icon: '🍼', name: '母婴' },
        { icon: '🥤', name: '食品饮料' }
      ],
      digital: [
        { icon: '📱', name: '手机' },
        { icon: '⌚', name: '穿戴' },
        { icon: '🎧', name: '音频' },
        { icon: '💻', name: '电脑' },
        { icon: '🎮', name: '智能硬件' }
      ],
      robot: [
        { icon: '🤖', name: '整机' },
        { icon: '🦾', name: '零部件' },
        { icon: '🏭', name: '工业自动化' },
        { icon: '🧠', name: '智能控制' },
        { icon: '🔧', name: '设备' }
      ],
      ai: [
        { icon: '🧠', name: '算力' },
        { icon: '☁️', name: '云计算' },
        { icon: '📊', name: '数据' },
        { icon: '🧩', name: '应用' },
        { icon: '🔌', name: '基础设施' }
      ],
      food: [
        { icon: '🥛', name: '乳品' },
        { icon: '🍪', name: '休闲食品' },
        { icon: '🥤', name: '饮料' },
        { icon: '🍜', name: '调味品' },
        { icon: '🌾', name: '粮油' }
      ],
      liquor: [
        { icon: '🍶', name: '白酒' },
        { icon: '🍷', name: '葡萄酒' },
        { icon: '🍺', name: '啤酒' },
        { icon: '🏷', name: '高端品牌' },
        { icon: '🧾', name: '渠道' }
      ],
      medical: [
        { icon: '💊', name: '创新药' },
        { icon: '🩺', name: '医疗器械' },
        { icon: '🧬', name: '生物医药' },
        { icon: '🏥', name: '医疗服务' },
        { icon: '🧓', name: '养老健康' }
      ]
    };

    return categoryMap[sector.id] || categoryMap.beauty;
  },

  buildDisplayItems(items, activeTab, filterText) {
    const sortedItems = this.sortDisplayItems(items || [], activeTab, filterText || this.data.selectedFilterText);

    return sortedItems.map((item) => {
      const displayActionText = activeTab === '指数'
        ? item.actionText
        : (item.followed ? '已加入' : '加入种草篮');

      return Object.assign({}, item, { displayActionText });
    });
  },

  sortDisplayItems(items, activeTab, filterText) {
    if (activeTab === '指数' || filterText === '综合排序') {
      return items.slice();
    }

    const parsePercent = (value) => Number(String(value).replace(/[+%]/g, '')) || 0;
    const parseNumber = (value) => Number(String(value).replace(/,/g, '')) || 0;

    return items.slice().sort((a, b) => {
      if (filterText === '近1年涨幅优先') {
        return parsePercent(b.changePercent) - parsePercent(a.changePercent);
      }

      if (filterText === '净值从低到高') {
        return parseNumber(a.latest) - parseNumber(b.latest);
      }

      if (filterText === '关注度优先') {
        return Number(b.followed) - Number(a.followed) || parsePercent(b.changePercent) - parsePercent(a.changePercent);
      }

      return 0;
    });
  },

  getTabItems(lists, activeTab) {
    if (activeTab === '全部') {
      return []
        .concat(lists.ETF基金 || [])
        .concat(lists.场外基金 || []);
    }

    if (activeTab === 'ETF') {
      return lists.ETF基金 || [];
    }

    return lists[activeTab] || [];
  },

  applyTabMeta(activeTab) {
    const meta = TAB_META[activeTab] || TAB_META.指数;
    this.setData({
      listNameTitle: meta.nameTitle,
      listValueTitle: meta.valueTitle,
      listActionTitle: meta.actionTitle,
      listMoreText: meta.moreText
    });
  },

  syncCartItems(lists, callback) {
    const sourceLists = lists || this.data.lists;
    const rawCartItems = []
      .concat(sourceLists.ETF基金 || [])
      .concat(sourceLists.场外基金 || [])
      .filter((item) => item.followed)
      .slice(0, 3);
    const cartItems = this.buildCartItems(rawCartItems);

    this.setData({
      cartItems,
      cartCount: cartItems.length
    }, callback);
  },

  buildCartItems(items) {
    const count = Math.max(items.length, 1);
    const amount = Math.floor(100000 / count);

    return items.map((item, index) => {
      const latestValue = Number(item.latest) || 1;
      const share = Math.max(Math.floor(amount / latestValue), 1);
      const weight = count === 1 ? '100.0' : (100 / count).toFixed(1);
      const profit = 286 + (index * 143);
      return Object.assign({}, item, {
        allocationAmount: this.formatMoney(amount),
        estimateShare: share.toLocaleString(),
        holdingWeight: `${weight}%`,
        floatingProfit: `+${this.formatMoney(profit)}`
      });
    });
  },

  handleSwitchSector(e) {
    const targetSectorId = e && e.currentTarget && e.currentTarget.dataset
      ? e.currentTarget.dataset.id
      : '';

    this.confirmSwitchSector(targetSectorId);
  },

  handleIndustryTabTap(e) {
    const targetSectorId = e.currentTarget.dataset.id;
    if (!targetSectorId || targetSectorId === this.data.sector.id) {
      return;
    }

    this.confirmSwitchSector(targetSectorId);
  },

  switchCategory(e) {
    this.setData({
      activeCategoryIndex: Number(e.currentTarget.dataset.index) || 0
    });
  },

  openFilterSheet() {
    wx.showActionSheet({
      itemList: ['综合排序', '近1年涨幅优先', '净值从低到高', '关注度优先'],
      success: (res) => {
        const options = ['综合排序', '近1年涨幅优先', '净值从低到高', '关注度优先'];
        const selectedFilterText = options[res.tapIndex] || options[0];
        this.setData({
          selectedFilterText,
          displayItems: this.buildDisplayItems(this.getTabItems(this.data.lists, this.data.activeTab), this.data.activeTab, selectedFilterText)
        });
      }
    });
  },

  confirmSwitchSector(targetSectorId) {
    wx.showModal({
      title: '切换赛道？',
      content: '专心研究一个赛道会好过泛泛地研究多个赛道，你确定要选择别的赛道吗？',
      confirmText: '重新选择',
      cancelText: '继续研究',
      success: (res) => {
        if (res.confirm) {
          if (targetSectorId) {
            this.loadSectorData(targetSectorId);
            return;
          }

          wx.redirectTo({ url: '/pages/learn/learn?forceSelect=1' });
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
      displayItems: this.buildDisplayItems(this.getTabItems(lists, this.data.activeTab), this.data.activeTab)
    }, () => {
      this.syncCartItems(lists);
    });
  },

  handleRowAction(e) {
    if (this.data.activeTab === '指数') {
      this.continueResearch();
      return;
    }

    this.toggleFollow(e);
  },

  previewItem(e) {
    const itemId = e.currentTarget.dataset.id;
    const item = (this.data.displayItems || []).find((displayItem) => displayItem.id === itemId);

    if (!item) {
      return;
    }

    if (this.data.activeTab === '指数') {
      this.continueResearch();
      return;
    }

    this.setData({
      selectedFund: item,
      activePeriod: '1D',
      returnView: this.data.tradeView,
      tradeView: 'detail'
    }, this.scrollTop);
  },

  switchPeriod(e) {
    this.setData({
      activePeriod: e.currentTarget.dataset.period
    });
  },

  addSelectedFundToBasket() {
    const fund = this.data.selectedFund;
    if (!fund) {
      return;
    }

    const lists = Object.assign({}, this.data.lists);
    Object.keys(lists).forEach((tab) => {
      lists[tab] = lists[tab].map((item) => {
        if (item.id !== fund.id) {
          return item;
        }
        return Object.assign({}, item, { followed: true });
      });
    });

    this.setData({
      lists,
      displayItems: this.buildDisplayItems(this.getTabItems(lists, this.data.activeTab), this.data.activeTab),
      selectedFund: Object.assign({}, fund, { followed: true })
    }, () => {
      this.syncCartItems(lists);
      wx.showToast({
        title: '已加入种草篮',
        icon: 'none'
      });
    });
  },

  openCheckout() {
    if (this.data.tradeView === 'detail' && this.data.selectedFund) {
      const fund = this.data.selectedFund;
      const lists = this.markFundFollowed(fund.id);

      this.setData({
        lists,
        selectedFund: Object.assign({}, fund, { followed: true }),
        displayItems: this.buildDisplayItems(this.getTabItems(lists, this.data.activeTab), this.data.activeTab)
      }, () => {
        this.syncCartItems(lists, () => {
          this.setData({
            tradeView: 'checkout'
          }, this.scrollTop);
        });
      });
      return;
    }

    if (!this.data.cartCount) {
      wx.showToast({
        title: '先加入1个标的',
        icon: 'none'
      });
      return;
    }

    this.setData({
      tradeView: 'basket'
    }, this.scrollTop);
  },

  beginCheckout() {
    if (!this.data.cartCount) {
      wx.showToast({
        title: '先加入1个标的',
        icon: 'none'
      });
      return;
    }

    this.setData({
      tradeView: 'checkout'
    }, this.scrollTop);
  },

  refreshAdvisorVotes() {
    const endpoint = wx.getStorageSync('advisorAgentEndpoint');
    if (!endpoint) {
      wx.showToast({
        title: '顾问团已给出模拟建议',
        icon: 'none'
      });
      return;
    }

    const payload = this.buildAdvisorPayload();
    wx.request({
      url: endpoint,
      method: 'POST',
      data: payload,
      success: (res) => {
        const advisors = this.normalizeAdvisorVotes(res.data && res.data.advisors);
        if (!advisors.length) return;
        this.setData({
          advisors,
          activeAdvisor: advisors[this.data.activeAdvisorIndex] || advisors[0],
          advisorSummary: res.data.summary || this.data.advisorSummary
        });
      },
      fail: () => {
        wx.showToast({
          title: '顾问团暂时离线',
          icon: 'none'
        });
      }
    });
  },

  buildAdvisorPayload() {
    return {
      sector: this.data.sector,
      amount: this.data.purchaseAmount,
      allocationMode: this.data.allocationMode,
      holdings: this.data.cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        latest: item.latest,
        changePercent: item.changePercent,
        allocationAmount: item.allocationAmount
      }))
    };
  },

  normalizeAdvisorVotes(advisors) {
    if (!Array.isArray(advisors)) return [];
    return advisors.slice(0, 4).map((item, index) => Object.assign({}, this.data.advisors[index] || {}, item, {
      status: item.status || 'agent'
    }));
  },

  selectAdvisor(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const activeAdvisor = this.data.advisors[index] || this.data.advisors[0];
    this.setData({
      activeAdvisorIndex: index,
      activeAdvisor
    });
  },

  markFundFollowed(fundId) {
    const lists = Object.assign({}, this.data.lists);
    Object.keys(lists).forEach((tab) => {
      lists[tab] = lists[tab].map((item) => {
        if (item.id !== fundId) {
          return item;
        }
        return Object.assign({}, item, { followed: true });
      });
    });
    return lists;
  },

  removeCartItem(e) {
    const itemId = e.currentTarget.dataset.id;
    const lists = Object.assign({}, this.data.lists);

    Object.keys(lists).forEach((tab) => {
      lists[tab] = lists[tab].map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        return Object.assign({}, item, { followed: false });
      });
    });

    this.setData({
      lists,
      displayItems: this.buildDisplayItems(this.getTabItems(lists, this.data.activeTab), this.data.activeTab)
    }, () => {
      this.syncCartItems(lists);
      if (!this.data.cartCount) {
        this.setData({ tradeView: 'research' }, this.scrollTop);
      }
    });
  },

  confirmPurchase() {
    const now = new Date();
    const orderTime = `${now.getFullYear()}-${this.pad(now.getMonth() + 1)}-${this.pad(now.getDate())} ${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`;
    this.setData({
      orderTime,
      tradeView: 'success'
    }, this.scrollTop);
  },

  openHoldings() {
    if (!this.data.cartCount) {
      return;
    }

    this.setData({
      tradeView: 'holdings'
    }, this.scrollTop);
  },

  closeFlowView() {
    if (this.data.tradeView === 'checkout') {
      this.setData({
        tradeView: 'basket'
      }, this.scrollTop);
      return;
    }

    if (this.data.tradeView === 'detail') {
      this.setData({
        tradeView: this.data.returnView || 'research',
        selectedFund: null
      }, this.scrollTop);
      return;
    }

    this.setData({
      tradeView: 'research'
    }, this.scrollTop);
  },

  clearBasket() {
    const lists = Object.assign({}, this.data.lists);
    Object.keys(lists).forEach((tab) => {
      lists[tab] = lists[tab].map((item) => Object.assign({}, item, { followed: false }));
    });

    this.setData({
      lists,
      displayItems: this.buildDisplayItems(this.getTabItems(lists, this.data.activeTab), this.data.activeTab),
      tradeView: 'research'
    }, () => {
      this.syncCartItems(lists);
    });
  },

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab,
      activeCategoryIndex: 0,
      displayItems: this.buildDisplayItems(this.getTabItems(this.data.lists, activeTab), activeTab)
    }, () => {
      this.applyTabMeta(activeTab);
    });
  },

  handleMoreTap() {
    if (this.data.tradeView === 'research' && this.data.activeTab === '指数') {
      this.continueResearch();
      return;
    }

    wx.showToast({
      title: '已展示当前筛选结果',
      icon: 'none'
    });
  },

  continueResearch() {
    const activeTab = '全部';
    this.setData({
      activeTab,
      tabs: FUND_TABS,
      tradeView: 'fundList',
      activeCategoryIndex: 0,
      displayItems: this.buildDisplayItems(this.getTabItems(this.data.lists, activeTab), activeTab)
    }, () => {
      this.applyTabMeta(activeTab);
      this.scrollTop();
    });
  },

  scrollTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 220,
      fail() {}
    });
  },

  pad(value) {
    return String(value).padStart(2, '0');
  },

  formatMoney(value) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  goBack() {
    if (this.data.tradeView !== 'research') {
      this.closeFlowView();
      return;
    }

    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({ url: '/pages/learn/learn?forceSelect=1' });
  }
});
