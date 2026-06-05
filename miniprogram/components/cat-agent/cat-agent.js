Component({
  properties: {
    x: { type: Number, value: 50 },
    y: { type: Number, value: 60 },
    mood: { type: String, value: "idle" },
    bubble: { type: String, value: "" },
    sprite: { type: String, value: "" },
    moveMs: { type: Number, value: 1200 },
    dir: { type: Number, value: 1 }
  },

  observers: {
    "mood, sprite": function updateSprite() {
      const sprites = {
        idle: "/assets/cat-idle-v6.png",
        walk: "/assets/cat-walk-v6.png",
        write: "/assets/cat-write-v6.png",
        nap: "/assets/cat-nap-v6.png",
        happy: "/assets/cat-happy-v6.png",
        cute: "/assets/cat-happy-v6.png",
        curious: "/assets/cat-idle-v6.png",
        hungry: "/assets/cat-idle-v6.png"
      };

      this.setData({
        currentSprite: this.data.sprite || sprites[this.data.mood] || sprites.idle
      });
    }
  },

  data: {
    currentSprite: "/assets/cat-idle-v6.png"
  },

  methods: {
    onTap() {
      this.triggerEvent("catTap");
    }
  }
});
