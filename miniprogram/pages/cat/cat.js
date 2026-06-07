const actionMap = {
  pet: {
    label: "抚摸",
    mood: "开心地眯起眼",
    image: "/assets/cat-happy-v6.png",
    feedback: "呼噜呼噜，小橘最喜欢被轻轻摸头啦。",
    affinity: 12,
  },
  feed: {
    label: "喂食",
    mood: "吃饱后摇尾巴",
    image: "/assets/cat-idle-v6.png",
    feedback: "小鱼干真香！小橘把碗舔得亮晶晶。",
    affinity: 10,
  },
  play: {
    label: "玩耍",
    mood: "扑向毛线球",
    image: "/assets/cat-walk-v6.png",
    feedback: "毛线球滚过去啦，小橘轻轻一扑！",
    affinity: 9,
  },
  bath: {
    label: "洗澡",
    mood: "香喷喷冒泡泡",
    image: "/assets/cat/cat-bath-awake.png",
    feedback: "泡泡软软的，小橘现在是干净小猫。",
    affinity: 8,
  },
};

Page({
  data: {
    resources: [
      { icon: "🥕", label: "芽币", value: 1280 },
      { icon: "☘️", label: "幸运草", value: 36 },
      { icon: "🐟", label: "小鱼干", value: 5 },
    ],
    cat: {
      name: "小橘",
      level: 12,
      mood: "今天的小猫很开心",
    },
    affinity: 92,
    affinityLabel: "亲密满格",
    heartSlots: [0, 1, 2, 3, 4],
    filledHearts: 5,
    dailyLimit: 3,
    interactionsLeft: 3,
    currentAction: "pet",
    catImage: "/assets/cat-happy-v6.png",
    feedbackText: "摸摸我？今天也想和你贴贴。",
    feedbackVisible: true,
    actions: [
      { id: "pet", label: "抚摸", icon: "🤚" },
      { id: "feed", label: "喂食", icon: "🍚" },
      { id: "play", label: "玩耍", icon: "🧶" },
      { id: "bath", label: "洗澡", icon: "🛁" },
    ],
  },

  feedbackTimer: null,
  resetTimer: null,

  onUnload() {
    this.clearTimers();
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }
    wx.redirectTo({ url: "/pages/house/house" });
  },

  handleAction(event) {
    const action = event.currentTarget.dataset.action;
    const config = actionMap[action];

    if (!config) return;

    const canCount = this.data.interactionsLeft > 0;
    const nextLeft = canCount ? this.data.interactionsLeft - 1 : 0;
    const nextAffinity = canCount ? Math.min(this.data.affinity + config.affinity, 100) : this.data.affinity;
    const feedbackText = canCount ? config.feedback : "今天互动次数用完啦，不过小橘还是会回应你。";

    this.clearTimers();
    this.setData({
      currentAction: action,
      catImage: config.image,
      "cat.mood": config.mood,
      affinity: nextAffinity,
      affinityLabel: nextAffinity >= 100 ? "亲密满格" : "亲密升温中",
      filledHearts: Math.max(1, Math.ceil(nextAffinity / 20)),
      interactionsLeft: nextLeft,
      feedbackText,
      feedbackVisible: true,
    });

    this.feedbackTimer = setTimeout(() => {
      this.setData({ feedbackVisible: false });
    }, 1800);

    this.resetTimer = setTimeout(() => {
      this.setData({
        currentAction: "idle",
        catImage: "/assets/cat-idle-v6.png",
        "cat.mood": "满足地陪着你",
        feedbackText: "小橘乖乖坐好，等你下一次互动。",
        feedbackVisible: true,
      });
    }, 2600);
  },

  clearTimers() {
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  },
});
