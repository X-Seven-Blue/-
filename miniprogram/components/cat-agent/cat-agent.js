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
        idle: "/assets/cat-idle-demo.png",
        walk: "/assets/cat-walk-demo.png",
        write: "/assets/cat-write-demo.png",
        nap: "/assets/cat-nap-demo.png",
        happy: "/assets/cat-happy-demo.png",
        cute: "/assets/cat-happy-demo.png",
        curious: "/assets/cat-idle-demo.png",
        hungry: "/assets/cat-idle-demo.png"
      };

      this.setData({
        currentSprite: this.data.sprite || sprites[this.data.mood] || sprites.idle
      });
    }
  },

  data: {
    currentSprite: "/assets/cat-idle-demo.png"
  },

  methods: {
    onTap() {
      this.triggerEvent("catTap");
    }
  }
});
