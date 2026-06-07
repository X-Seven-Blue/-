const seedCatalog = [
  { id: 'carrot', name: '胡萝卜', icon: '🥕', stock: 18, growMinutes: 165, reward: 28 },
  { id: 'greens', name: '小白菜', icon: '🥬', stock: 22, growMinutes: 120, reward: 24 },
  { id: 'tomato', name: '番茄', icon: '🍅', stock: 15, growMinutes: 210, reward: 36 },
  { id: 'eggplant', name: '茄子', icon: '🍆', stock: 12, growMinutes: 240, reward: 42 },
  { id: 'pumpkin', name: '南瓜', icon: '🎃', stock: 9, growMinutes: 300, reward: 58 },
];

const cropMap = seedCatalog.reduce((map, seed) => {
  map[seed.id] = seed;
  return map;
}, {});

function formatMinutes(total) {
  if (!total) return '--:--';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function createPlot(options) {
  const crop = options.cropId ? cropMap[options.cropId] : null;
  return {
    id: options.id,
    state: options.state,
    cropId: options.cropId || '',
    cropName: crop ? crop.name : '空地',
    icon: crop ? crop.icon : '🌱',
    progress: options.progress || 0,
    moisture: options.moisture || 0,
    fertilizer: options.fertilizer || 0,
    remainingMinutes: options.remainingMinutes || 0,
    remainingText: formatMinutes(options.remainingMinutes || 0),
    reward: crop ? crop.reward : 0,
  };
}

Page({
  data: {
    resources: [
      { id: 'sprout', icon: '🌱', value: 1280 },
      { id: 'clover', icon: '☘️', value: 36 },
      { id: 'fish', icon: '🐟', value: 5 },
    ],
    helperText: '小贴士：保持水分和肥力充足，作物会长得更快哦～',
    selectedPlotId: 'plot-2',
    selectedSeedId: 'carrot',
    selectedPlot: {},
    selectedSeed: {},
    actions: {
      water: 8,
      fertilizer: 6,
      speed: 3,
    },
    seeds: seedCatalog,
    plots: [
      createPlot({ id: 'plot-1', state: 'empty' }),
      createPlot({ id: 'plot-2', state: 'growing', cropId: 'carrot', progress: 65, moisture: 3, fertilizer: 2, remainingMinutes: 165 }),
      createPlot({ id: 'plot-3', state: 'growing', cropId: 'greens', progress: 74, moisture: 3, fertilizer: 3, remainingMinutes: 84 }),
      createPlot({ id: 'plot-4', state: 'growing', cropId: 'tomato', progress: 42, moisture: 2, fertilizer: 2, remainingMinutes: 75 }),
      createPlot({ id: 'plot-5', state: 'ready', cropId: 'carrot', progress: 100, moisture: 4, fertilizer: 4 }),
      createPlot({ id: 'plot-6', state: 'locked' }),
    ],
  },

  onLoad() {
    this.syncSelection();
  },

  syncSelection(extra = {}) {
    const selectedPlot = this.data.plots.find((plot) => plot.id === this.data.selectedPlotId) || this.data.plots[0];
    const selectedSeed = this.data.seeds.find((seed) => seed.id === this.data.selectedSeedId) || this.data.seeds[0];
    this.setData({
      selectedPlot,
      selectedSeed,
      ...extra,
    });
  },

  selectPlot(event) {
    const id = event.currentTarget.dataset.id;
    const plot = this.data.plots.find((item) => item.id === id);
    if (!plot) return;

    if (plot.state === 'locked') {
      this.nudge('这块菜地 13 级解锁。');
      return;
    }

    this.setData({ selectedPlotId: id }, () => {
      this.syncSelection({
        helperText: plot.state === 'empty'
          ? '选一颗种子，再点“播种”，这块地就能开始生长。'
          : `${plot.cropName}正在照顾中，水分和肥力越足越安心。`,
      });
    });
  },

  selectSeed(event) {
    const id = event.currentTarget.dataset.id;
    const seed = this.data.seeds.find((item) => item.id === id);
    if (!seed) return;

    this.setData({ selectedSeedId: id }, () => {
      this.syncSelection({
        helperText: `已经选中${seed.name}，选择空地后点击“播种”。`,
      });
      wx.showToast({ title: `已选${seed.name}`, icon: 'none', duration: 1000 });
    });
  },

  plantSelected() {
    const plot = this.data.selectedPlot;
    const seed = this.data.selectedSeed;
    if (!plot || plot.state !== 'empty') {
      this.nudge('先选择一块空地再播种。');
      return;
    }
    if (!seed || seed.stock <= 0) {
      this.nudge('这包种子数量不足。');
      return;
    }

    const plots = this.data.plots.map((item) => {
      if (item.id !== plot.id) return item;
      return createPlot({
        id: item.id,
        state: 'growing',
        cropId: seed.id,
        progress: 18,
        moisture: 2,
        fertilizer: 1,
        remainingMinutes: seed.growMinutes,
      });
    });
    const seeds = this.data.seeds.map((item) => (
      item.id === seed.id ? { ...item, stock: item.stock - 1 } : item
    ));

    this.setData({ plots, seeds }, () => {
      this.syncSelection({ helperText: `${seed.name}已播种，记得浇水施肥。` });
      wx.showToast({ title: '播种成功', icon: 'success', duration: 1000 });
    });
  },

  waterPlot() {
    const plot = this.data.selectedPlot;
    if (!this.canCare(plot)) return;
    if (this.data.actions.water <= 0) {
      this.nudge('水壶次数用完了。');
      return;
    }
    this.updateGrowingPlot({
      actionKey: 'water',
      progressGain: 9,
      moistureGain: 1,
      fertilizerGain: 0,
      minutesCut: 22,
      text: `${plot.cropName}喝饱水了。`,
    });
  },

  fertilizePlot() {
    const plot = this.data.selectedPlot;
    if (!this.canCare(plot)) return;
    if (this.data.actions.fertilizer <= 0) {
      this.nudge('肥料次数用完了。');
      return;
    }
    this.updateGrowingPlot({
      actionKey: 'fertilizer',
      progressGain: 12,
      moistureGain: 0,
      fertilizerGain: 1,
      minutesCut: 32,
      text: `${plot.cropName}吸收了肥力。`,
    });
  },

  speedUpPlot() {
    const plot = this.data.selectedPlot;
    if (!this.canCare(plot)) return;
    if (this.data.actions.speed <= 0) {
      this.nudge('加速次数用完了。');
      return;
    }
    this.updateGrowingPlot({
      actionKey: 'speed',
      progressGain: 18,
      moistureGain: 0,
      fertilizerGain: 0,
      minutesCut: 55,
      text: '加速生效，成熟时间缩短了。',
    });
  },

  harvestPlot() {
    const plot = this.data.selectedPlot;
    if (!plot || plot.state !== 'ready') {
      this.nudge('还没有成熟作物可以收获。');
      return;
    }

    const resources = this.data.resources.map((item) => (
      item.id === 'sprout' ? { ...item, value: item.value + plot.reward } : item
    ));
    const plots = this.data.plots.map((item) => (
      item.id === plot.id ? createPlot({ id: item.id, state: 'empty' }) : item
    ));

    this.setData({ resources, plots }, () => {
      this.syncSelection({ helperText: `收获${plot.cropName}，芽币 +${plot.reward}。` });
      wx.showToast({ title: `收获 +${plot.reward}`, icon: 'success', duration: 1000 });
    });
  },

  canCare(plot) {
    if (!plot || plot.state === 'empty') {
      this.nudge('先播种，再照顾作物。');
      return false;
    }
    if (plot.state === 'locked') {
      this.nudge('这块地还没有解锁。');
      return false;
    }
    if (plot.state === 'ready') {
      this.nudge('作物已经成熟，可以直接收获。');
      return false;
    }
    return true;
  },

  updateGrowingPlot(options) {
    const actions = {
      ...this.data.actions,
      [options.actionKey]: this.data.actions[options.actionKey] - 1,
    };
    const plots = this.data.plots.map((item) => {
      if (item.id !== this.data.selectedPlot.id) return item;
      const progress = Math.min(100, item.progress + options.progressGain);
      const remainingMinutes = Math.max(0, item.remainingMinutes - options.minutesCut);
      return {
        ...item,
        state: progress >= 100 ? 'ready' : 'growing',
        progress,
        moisture: Math.min(4, item.moisture + options.moistureGain),
        fertilizer: Math.min(4, item.fertilizer + options.fertilizerGain),
        remainingMinutes,
        remainingText: progress >= 100 ? '已成熟' : formatMinutes(remainingMinutes),
      };
    });
    const caredPlot = plots.find((item) => item.id === this.data.selectedPlot.id);
    const helperText = caredPlot.progress >= 100 ? `${caredPlot.cropName}成熟啦，快收获。` : options.text;

    this.setData({ actions, plots }, () => {
      this.syncSelection({ helperText });
    });
  },

  nudge(text) {
    this.setData({ helperText: text });
    wx.showToast({ title: text, icon: 'none', duration: 1200 });
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }
    wx.redirectTo({ url: '/pages/house/house' });
  },
});
