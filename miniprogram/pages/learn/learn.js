const { sectors } = require('../../data/sectorData');

const islandSubjects = [
  { id: 'finance', name: '金融学科', left: 178, top: 502, color: 'gold', progress: 78 },
  { id: 'consumer', name: '消费学科', left: 370, top: 406, color: 'pink', progress: 75 },
  { id: 'tech', name: '科技学科', left: 548, top: 476, color: 'blue', progress: 68 },
  { id: 'energy', name: '能源学科', left: 262, top: 674, color: 'purple', progress: 52 },
  { id: 'medical', name: '医疗学科', left: 588, top: 636, color: 'green', progress: 61 },
  { id: 'manufacture', name: '制造学科', left: 464, top: 776, color: 'violet', progress: 58 }
];

const consumerTreeNodes = [
  { id: 'macro', name: '宏观与趋势', status: 'learned', percent: 80, left: 356, top: 296 },
  { id: 'beauty', name: '美妆行业', status: 'learning', percent: 75, left: 278, top: 444 },
  { id: 'mind', name: '消费心理', status: 'learned', percent: 60, left: 112, top: 578 },
  { id: 'brand', name: '品牌与营销', status: 'locked', percent: 65, left: 526, top: 626 },
  { id: 'channel', name: '渠道与零售', status: 'waiting', percent: 40, left: 220, top: 748 },
  { id: 'care', name: '个护家清', status: 'waiting', percent: 35, left: 538, top: 820 },
  { id: 'luxury', name: '奢侈品行业', status: 'locked', percent: 0, left: 318, top: 948 }
];

const beautyTreeNodes = [
  { id: 'overview', name: '行业概览', status: 'learned', percent: 100, left: 356, top: 250 },
  { id: 'scale', name: '市场规模与增长', status: 'learned', percent: 90, left: 530, top: 354 },
  { id: 'competition', name: '竞争格局', status: 'learning', percent: 60, left: 322, top: 514 },
  { id: 'consumer', name: '消费者画像', status: 'learned', percent: 75, left: 560, top: 646 },
  { id: 'brand', name: '品牌分析', status: 'learned', percent: 80, left: 472, top: 796 },
  { id: 'supply', name: '产业链分析', status: 'learned', percent: 50, left: 206, top: 792 },
  { id: 'channel', name: '渠道结构', status: 'waiting', percent: 30, left: 528, top: 956 },
  { id: 'future', name: '未来趋势', status: 'locked', percent: 0, left: 294, top: 1060 }
];

const nodeDetailMap = {
  beauty: {
    title: '美妆行业',
    desc: '探索美妆行业的市场格局、增长逻辑与投资机会',
    icon: '/assets/learn/icon-beauty-card-demo.png',
    progress: 75,
    action: ''
  },
  competition: {
    title: '竞争格局',
    desc: '分析国内外品牌竞争态势、市场集中度以及头部品牌的护城河',
    icon: '',
    progress: 60,
    action: '继续学习'
  }
};

Page({
  touchStartPoint: null,
  leftSwipeCount: 0,
  leftSwipeTimer: null,

  data: {
    resources: [
      { icon: '🌱', value: 1280 },
      { icon: '☘️', value: 36 },
      { icon: '🐟', value: 5 }
    ],
    sectors,
    sectorRows: [sectors.slice(0, 4), sectors.slice(4)],
    selectedSectorId: sectors[0].id,
    selectedSector: sectors[0],
    learnView: 'select',
    lessonStep: 2,
    lessonTotal: 8,
    lessonProgress: 26,
    islandSubjects,
    islandProgress: {
      percent: 68,
      days: 23,
      videos: 48,
      points: 126,
      badges: 12
    },
    treeTitle: '消费学科',
    treeSubtitle: '知识树',
    treeBg: '/assets/learn/knowledge-tree.jpg',
    treeNodes: consumerTreeNodes,
    selectedNodeId: 'beauty',
    selectedNode: nodeDetailMap.beauty,
    treeMastered: '',
    treeZooming: false,
    treeScrollLeft: 0,
    treeScrollTop: 0
  },

  onLoad(options) {
    if (options.forceSelect === '1') {
      this.setInitialSelection('select');
      return;
    }

    const storedSectorId = wx.getStorageSync('selectedSectorId');
    if (storedSectorId) {
      const selectedSector = sectors.find((sector) => sector.id === storedSectorId) || sectors[0];
      this.setData({
        selectedSectorId: selectedSector.id,
        selectedSector,
        learnView: options.view || 'video'
      });
      return;
    }

    this.setInitialSelection(options.view || 'select');
  },

  setInitialSelection(learnView) {
    const selectedSector = sectors[0];
    this.setData({
      selectedSectorId: selectedSector.id,
      selectedSector,
      learnView
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
    if (sectors.length <= 1) return;

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

  enterStudy() {
    wx.setStorageSync('selectedSectorId', this.data.selectedSectorId || sectors[0].id);
    this.setData({ learnView: 'video' }, this.scrollTop);
  },

  openIsland() {
    this.setData({ learnView: 'island' }, this.scrollTop);
  },

  openConsumerTree() {
    this.setData({
      learnView: 'tree',
      treeTitle: '消费学科',
      treeSubtitle: '知识树',
      treeBg: '/assets/learn/knowledge-tree.jpg',
      treeNodes: consumerTreeNodes,
      selectedNodeId: 'beauty',
      selectedNode: nodeDetailMap.beauty,
      treeMastered: '',
      treeZooming: true,
      treeScrollLeft: 0,
      treeScrollTop: 120
    }, this.scrollTop);
    this.clearTreeZooming();
  },

  openTree(e) {
    const subjectId = e.currentTarget.dataset.id;
    if (subjectId === 'consumer') {
      this.openConsumerTree();
      return;
    }

    wx.showToast({
      title: '先从消费学科开始',
      icon: 'none'
    });
  },

  openBeautyTree() {
    this.setData({
      learnView: 'tree',
      treeTitle: '美妆行业',
      treeSubtitle: '知识树',
      treeBg: '/assets/learn/beauty-sakura-tree-demo.jpg',
      treeNodes: beautyTreeNodes,
      selectedNodeId: 'competition',
      selectedNode: nodeDetailMap.competition,
      treeMastered: '已掌握 18/24',
      treeZooming: true,
      treeScrollLeft: 0,
      treeScrollTop: 160
    }, this.scrollTop);
    this.clearTreeZooming();
  },

  selectTreeNode(e) {
    const nodeId = e.currentTarget.dataset.id;
    const node = this.data.treeNodes.find((item) => item.id === nodeId);
    if (!node) return;

    const mapped = nodeDetailMap[nodeId] || {
      title: node.name,
      desc: node.status === 'locked' ? '完成前置知识后解锁这个节点' : '继续学习这个知识点，补齐你的赛道判断框架',
      icon: nodeId === 'overview' ? '/assets/learn/icon-beauty-card-demo.png' : '',
      progress: node.percent,
      action: node.status === 'learning' ? '继续学习' : ''
    };

    this.setData({
      selectedNodeId: nodeId,
      selectedNode: mapped,
      treeScrollLeft: Math.max(Number(node.left) - 260, 0),
      treeScrollTop: Math.max(Number(node.top) - 280, 0)
    });
  },

  clearTreeZooming() {
    setTimeout(() => {
      this.setData({ treeZooming: false });
    }, 620);
  },

  handleTreeAction() {
    if (this.data.selectedNodeId === 'beauty' && this.data.treeTitle === '消费学科') {
      this.openBeautyTree();
      return;
    }

    wx.showToast({
      title: '开始学习当前知识点',
      icon: 'none'
    });
  },

  handleLearnTouchStart(e) {
    const touch = e.touches && e.touches[0];
    if (!touch) return;

    this.touchStartPoint = {
      x: touch.clientX,
      y: touch.clientY
    };
  },

  handleLearnTouchEnd(e) {
    if (this.data.learnView === 'select' || !this.touchStartPoint) return;

    const touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - this.touchStartPoint.x;
    const deltaY = touch.clientY - this.touchStartPoint.y;
    this.touchStartPoint = null;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 72) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 72) {
        this.handleRightSwipe();
        return;
      }

      if (deltaX < -72) {
        this.handleLeftSwipe();
      }
      return;
    }

    if (deltaY > 72) {
      this.nextLesson();
      return;
    }

    if (deltaY < -72) {
      this.previousLesson();
    }
  },

  handleRightSwipe() {
    if (this.data.learnView === 'video') {
      this.openIsland();
      return;
    }

    if (this.data.learnView === 'island') {
      this.openConsumerTree();
      return;
    }

    if (this.data.learnView === 'tree') {
      this.handleTreeAction();
    }
  },

  handleLeftSwipe() {
    this.leftSwipeCount += 1;

    if (this.leftSwipeTimer) {
      clearTimeout(this.leftSwipeTimer);
    }

    if (this.leftSwipeCount >= 2) {
      this.leftSwipeCount = 0;
      this.goBack();
      return;
    }

    wx.showToast({
      title: '继续学习，知识树快点亮了',
      icon: 'none'
    });

    this.leftSwipeTimer = setTimeout(() => {
      this.leftSwipeCount = 0;
    }, 1200);
  },

  nextLesson() {
    const nextStep = this.data.lessonStep >= this.data.lessonTotal
      ? 1
      : this.data.lessonStep + 1;

    this.updateLessonStep(nextStep, '下一个视频');
  },

  previousLesson() {
    const nextStep = this.data.lessonStep <= 1
      ? this.data.lessonTotal
      : this.data.lessonStep - 1;

    this.updateLessonStep(nextStep, '上一个视频');
  },

  updateLessonStep(nextStep, title) {
    this.setData({
      lessonStep: nextStep,
      lessonProgress: Math.round((nextStep / this.data.lessonTotal) * 100)
    });

    wx.showToast({
      title,
      icon: 'none'
    });
  },

  backInLearn() {
    if (this.data.learnView === 'tree') {
      this.setData({ learnView: 'island' }, this.scrollTop);
      return;
    }

    if (this.data.learnView === 'island') {
      this.setData({ learnView: 'video' }, this.scrollTop);
      return;
    }

    this.goBack();
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({ url: '/pages/house/house' });
  },

  onUnload() {
    if (this.leftSwipeTimer) {
      clearTimeout(this.leftSwipeTimer);
    }
  },

  scrollTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0,
      fail() {}
    });
  }
});
