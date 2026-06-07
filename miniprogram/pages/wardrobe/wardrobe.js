const catalogs = {
  hat: [
    {
      id: "straw",
      name: "草帽",
      artClass: "straw",
      icon: "/assets/wardrobe/hat-straw.png",
      owned: true,
      currency: "plant",
      price: 0,
      unlock: "已拥有",
      desc: "柔软的草编帽，适合在阳光房里打盹。"
    },
    {
      id: "detective",
      name: "侦探帽",
      artClass: "detective",
      icon: "/assets/wardrobe/hat-detective.png",
      currency: "fish",
      price: 80,
      unlock: "直接购买",
      desc: "经典的侦探格纹帽，戴上更容易发现小秘密哦~"
    },
    {
      id: "beret",
      name: "贝雷帽",
      artClass: "beret",
      icon: "/assets/wardrobe/hat-beret.png",
      currency: "clover",
      price: 12,
      unlock: "直接购买",
      desc: "红棕色贝雷帽，适合安静读书的下午。"
    },
    {
      id: "cowboy",
      name: "牛仔帽",
      artClass: "cowboy",
      icon: "/assets/wardrobe/hat-cowboy.png",
      currency: "fish",
      price: 120,
      unlock: "直接购买",
      desc: "带一点冒险气质，走路会更有精神。"
    },
    {
      id: "student",
      name: "学生帽",
      artClass: "student",
      icon: "/assets/wardrobe/hat-student.png",
      locked: true,
      currency: "clover",
      price: 0,
      unlock: "任务解锁",
      desc: "完成今日学习任务后解锁。"
    },
    {
      id: "wizard",
      name: "魔法帽",
      artClass: "wizard",
      icon: "/assets/wardrobe/hat-wizard.png",
      locked: true,
      currency: "clover",
      price: 0,
      unlock: "提前解锁",
      desc: "闪着小星星的尖帽，适合神秘场合。"
    },
    {
      id: "fisher",
      name: "渔夫帽",
      artClass: "fisher",
      icon: "/assets/wardrobe/hat-fisher.png",
      currency: "clover",
      price: 50,
      unlock: "直接购买",
      desc: "清爽浅色帽檐，出门浇花也很好看。"
    },
    {
      id: "star",
      name: "星星发箍",
      artClass: "star",
      icon: "/assets/wardrobe/hat-star.png",
      locked: true,
      currency: "fish",
      price: 0,
      unlock: "任务解锁",
      desc: "适合拍照的小发箍，完成社交任务后获得。"
    }
  ],
  top: [
    { id: "cape", name: "侦探披肩", artClass: "cape", currency: "fish", price: 90, unlock: "直接购买", desc: "格纹披肩和放大镜挂饰，和侦探帽刚好成套。" },
    { id: "shirt", name: "奶油衬衣", artClass: "shirt", owned: true, currency: "clover", price: 0, unlock: "已拥有", desc: "柔软干净的基础款，适合每天穿。" },
    { id: "coat", name: "南瓜外套", artClass: "coat", currency: "fish", price: 110, unlock: "直接购买", desc: "暖橙色小外套，和木质房间很搭。" },
    { id: "scarf", name: "绿格围巾", artClass: "scarf", currency: "clover", price: 28, unlock: "直接购买", desc: "微凉天气的舒服搭配。" }
  ],
  bottom: [
    { id: "shorts", name: "灯芯绒短裤", artClass: "shorts", currency: "clover", price: 24, unlock: "直接购买", desc: "小猫行动方便，配色也温柔。" },
    { id: "skirt", name: "学院短裙", artClass: "skirt", currency: "fish", price: 65, unlock: "直接购买", desc: "带一点学院风的下装。" },
    { id: "pants", name: "园艺背带裤", artClass: "pants", locked: true, currency: "clover", price: 0, unlock: "任务解锁", desc: "完成花园收获任务后解锁。" }
  ],
  set: [
    { id: "detective-set", name: "侦探套装", artClass: "detective", currency: "fish", price: 150, unlock: "直接购买", desc: "帽子、披肩、放大镜一次配齐。" },
    { id: "garden-set", name: "园艺套装", artClass: "garden", currency: "clover", price: 88, unlock: "直接购买", desc: "适合在小花园里巡视。" },
    { id: "magic-set", name: "魔法套装", artClass: "magic", locked: true, currency: "fish", price: 0, unlock: "任务解锁", desc: "夜晚活动限定套装。" }
  ],
  accessory: [
    { id: "lens", name: "放大镜", artClass: "lens", currency: "fish", price: 35, unlock: "直接购买", desc: "挂在胸前的小道具，侦探感满分。" },
    { id: "bell", name: "金色铃铛", artClass: "bell", owned: true, currency: "clover", price: 0, unlock: "已拥有", desc: "走路时会轻轻响的经典项圈。" },
    { id: "glasses", name: "圆框眼镜", artClass: "glasses", currency: "clover", price: 45, unlock: "直接购买", desc: "认真研究行情时特别合适。" }
  ]
};

const currencyMeta = {
  plant: { label: "植物", fallback: "🌱" },
  clover: { label: "四叶草", fallback: "☘️" },
  fish: { label: "小鱼", fallback: "🐟" }
};

const defaultLook = {
  hat: "straw",
  top: "shirt",
  bottom: "shorts",
  set: "",
  accessory: "bell"
};

function decorateItems(items) {
  return items.map((item) => ({
    ...item,
    currencyIcon: currencyMeta[item.currency] ? currencyMeta[item.currency].fallback : ""
  }));
}

function cloneCatalogs(source) {
  return Object.keys(source).reduce((next, key) => {
    next[key] = source[key].map((item) => ({ ...item }));
    return next;
  }, {});
}

function findLookItem(catalogData, tab, id) {
  if (!id || !catalogData[tab]) return null;
  const item = catalogData[tab].find((entry) => entry.id === id);
  return item ? decorateItems([item])[0] : null;
}

function buildLookSlots(catalogData, look) {
  const slots = {
    hat: findLookItem(catalogData, "hat", look.hat),
    top: findLookItem(catalogData, "top", look.top),
    bottom: findLookItem(catalogData, "bottom", look.bottom),
    set: findLookItem(catalogData, "set", look.set),
    accessory: findLookItem(catalogData, "accessory", look.accessory)
  };
  return slots;
}

function buildLookList(slots) {
  return [
    { key: "hat", label: "头饰", item: slots.hat },
    { key: "top", label: "上衣", item: slots.top },
    { key: "bottom", label: "下装", item: slots.bottom },
    { key: "set", label: "套装", item: slots.set },
    { key: "accessory", label: "饰品", item: slots.accessory }
  ].filter((entry) => entry.item);
}

const initialCatalogData = cloneCatalogs(catalogs);
const initialLookSlots = buildLookSlots(initialCatalogData, defaultLook);

Page({
  data: {
    wallets: [
      { id: "plant", value: 1280, icon: "🌱" },
      { id: "clover", value: 36, icon: "☘️" },
      { id: "fish", value: 5, icon: "🐟" }
    ],
    tabs: [
      { id: "hat", name: "头饰", icon: "/assets/wardrobe/hat-straw.png" },
      { id: "top", name: "上衣", textIcon: "衣" },
      { id: "bottom", name: "下装", textIcon: "裤" },
      { id: "set", name: "套装", textIcon: "套" },
      { id: "accessory", name: "饰品", textIcon: "镜" }
    ],
    activeTab: "hat",
    catalogData: initialCatalogData,
    items: decorateItems(catalogs.hat),
    selectedItem: decorateItems(catalogs.hat)[0],
    currentLook: { ...defaultLook },
    savedLook: { ...defaultLook },
    savedLooks: [],
    lookSlots: initialLookSlots,
    lookList: buildLookList(initialLookSlots)
  },

  refreshLook(extra = {}) {
    const lookSlots = buildLookSlots(this.data.catalogData, this.data.currentLook);
    this.setData({
      lookSlots,
      lookList: buildLookList(lookSlots),
      ...extra
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.switchTab({
      url: "/pages/index/index",
      fail: () => wx.navigateTo({ url: "/pages/index/index" })
    });
  },

  switchTab(event) {
    const activeTab = event.currentTarget.dataset.id;
    const items = decorateItems(this.data.catalogData[activeTab] || this.data.catalogData.hat);
    const previewId = this.data.currentLook[activeTab];
    this.setData({
      activeTab,
      items,
      selectedItem: items.find((item) => item.id === previewId) || items.find((item) => !item.locked) || items[0]
    });
  },

  selectItem(event) {
    const id = event.currentTarget.dataset.id;
    const selectedItem = this.data.items.find((item) => item.id === id);
    if (!selectedItem) return;
    const currentLook = selectedItem.locked
      ? this.data.currentLook
      : { ...this.data.currentLook, [this.data.activeTab]: selectedItem.id };
    this.setData({ selectedItem, currentLook }, () => {
      if (!selectedItem.locked) this.refreshLook();
    });
    wx.showToast({
      title: selectedItem.locked ? "还未解锁" : "试穿中",
      icon: "none",
      duration: 900
    });
  },

  saveLook() {
    const savedLook = { ...this.data.currentLook };
    const savedLooks = [
      {
        id: `look-${Date.now()}`,
        title: this.data.lookList.map((entry) => entry.item.name).join(" + "),
        items: this.data.lookList.slice(0, 4)
      },
      ...this.data.savedLooks
    ].slice(0, 2);
    this.setData({
      savedLook,
      savedLooks
    });
    wx.showToast({ title: "搭配已保存", icon: "success", duration: 900 });
  },

  resetLook() {
    const catalogData = cloneCatalogs(catalogs);
    const items = decorateItems(catalogData.hat);
    const lookSlots = buildLookSlots(catalogData, defaultLook);
    this.setData({
      catalogData,
      activeTab: "hat",
      items,
      selectedItem: items[0],
      currentLook: { ...defaultLook },
      savedLook: { ...defaultLook },
      savedLooks: [],
      lookSlots,
      lookList: buildLookList(lookSlots)
    });
    wx.showToast({ title: "已重置", icon: "none", duration: 900 });
  },

  buySelected() {
    const item = this.data.selectedItem;
    if (!item || item.locked) {
      wx.showToast({ title: "需要先解锁", icon: "none", duration: 1000 });
      return;
    }
    if (item.owned) {
      this.saveLook();
      return;
    }

    const wallet = this.data.wallets.find((entry) => entry.id === item.currency);
    if (item.price > 0 && (!wallet || wallet.value < item.price)) {
      wx.showToast({ title: "资源不足", icon: "none", duration: 1000 });
      return;
    }

    const wallets = this.data.wallets.map((entry) => (
      entry.id === item.currency ? { ...entry, value: entry.value - item.price } : entry
    ));
    const catalogData = {
      ...this.data.catalogData,
      [this.data.activeTab]: this.data.catalogData[this.data.activeTab].map((entry) => (
        entry.id === item.id ? { ...entry, owned: true, unlock: "已拥有", price: 0 } : entry
      ))
    };
    const items = decorateItems(catalogData[this.data.activeTab]);
    const selectedItem = items.find((entry) => entry.id === item.id);
    const currentLook = {
      ...this.data.currentLook,
      [this.data.activeTab]: item.id
    };
    const lookSlots = buildLookSlots(catalogData, currentLook);

    this.setData({
      wallets,
      catalogData,
      items,
      selectedItem,
      currentLook,
      savedLook: { ...currentLook },
      lookSlots,
      lookList: buildLookList(lookSlots)
    });
    wx.showToast({ title: "购买成功", icon: "success", duration: 1000 });
  }
});
