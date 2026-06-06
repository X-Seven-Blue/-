const { hotspots } = require("../../config/hotspots");

const roomBg = { width: 941, height: 1672 };

const floorLanes = {
  upper: { y: 48.5, stairGate: { x: 18.8, y: 49 } },
  lower: { y: 86, stairGate: { x: 6.2, y: 77.5 } }
};

const stairPath = [
  { x: 18.8, y: 49 },
  { x: 17.2, y: 52.3 },
  { x: 15.3, y: 56.1 },
  { x: 13.2, y: 60 },
  { x: 11.1, y: 64.1 },
  { x: 9.1, y: 68.4 },
  { x: 7.4, y: 72.7 },
  { x: 6.2, y: 77.5 }
];

const places = {
  rug: { x: 52, y: 49.5, floor: "upper" },
  tv: { x: 27, y: 49, floor: "upper" },
  desk: { x: 70, y: 48, floor: "upper" },
  window: { x: 52, y: 43, floor: "upper" },
  catTree: { x: 84, y: 48.5, floor: "upper" },
  garden: { x: 30, y: 86, floor: "lower" },
  closet: { x: 75, y: 87, floor: "lower" }
};

const routine = [
  { mood: "idle", place: "rug", moveText: "我回地毯坐一会儿。", text: "阳光刚刚好。", stay: 2600 },
  { mood: "idle", place: "window", moveText: "我去窗边看看天气。", text: "外面的树好绿。", stay: 2300 },
  { mood: "write", place: "desk", moveText: "我去书桌写便签。", text: "今天也记一点新知识。", stay: 3400 },
  { mood: "idle", place: "tv", moveText: "我去电视旁看看。", text: "先观察，再交易。", stay: 2400 },
  { mood: "idle", place: "garden", moveText: "我下楼看看菜苗。", text: "菜苗长高了一点点。", stay: 2600 },
  { mood: "happy", place: "closet", moveText: "我去衣柜旁转一圈。", text: "这件小衣服很舒服。", stay: 2400 },
  { mood: "nap", place: "rug", moveText: "我回地毯午休。", text: "午休十分钟。", stay: 3600 }
];

const closeEnough = (a, b) => Math.abs(a.x - b.x) < 0.35 && Math.abs(a.y - b.y) < 0.35;

const inferFloor = (point) => point.floor || (point.y >= 62 ? "lower" : "upper");

const pushPoint = (path, point) => {
  const next = { ...point };
  const last = path[path.length - 1];
  if (!last || !closeEnough(last, next)) {
    path.push(next);
  }
};

const buildFloorPath = (from, to, floor) => {
  const path = [];
  const laneY = floorLanes[floor].y;
  const fromOnLane = Math.abs(from.y - laneY) < 1.1;
  const toOnLane = Math.abs(to.y - laneY) < 1.1;

  if (!fromOnLane) pushPoint(path, { x: from.x, y: laneY, floor });
  if (Math.abs(from.x - to.x) > 0.6) pushPoint(path, { x: to.x, y: laneY, floor });
  if (!toOnLane || !closeEnough(path[path.length - 1] || from, to)) pushPoint(path, { ...to, floor });

  return path;
};

const buildCatRoute = (from, to) => {
  const fromFloor = inferFloor(from);
  const toFloor = inferFloor(to);

  if (fromFloor === toFloor) {
    return buildFloorPath(from, to, toFloor);
  }

  const path = [];
  const fromGate = { ...floorLanes[fromFloor].stairGate, floor: fromFloor };
  const toGate = { ...floorLanes[toFloor].stairGate, floor: toFloor };
  const stairs = fromFloor === "upper" ? stairPath : stairPath.slice().reverse();

  buildFloorPath(from, fromGate, fromFloor).forEach((point) => pushPoint(path, point));
  stairs.forEach((point) => pushPoint(path, { ...point, floor: point.y >= 62 ? "lower" : "upper" }));
  pushPoint(path, toGate);
  buildFloorPath(toGate, to, toFloor).forEach((point) => pushPoint(path, point));

  return path;
};

const getSegmentDuration = (from, to) => {
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  const onStairs = Math.abs(to.y - from.y) > 2.4 && Math.abs(to.x - from.x) < 5;
  const speed = onStairs ? 190 : 145;

  return Math.max(720, Math.min(3200, Math.round(distance * speed)));
};

Page({
  routineIndex: 0,

  data: {
    hotspots,
    sceneScrollLeft: 0,
    sceneWidthStyle: "",
    cat: {
      x: places.rug.x,
      y: places.rug.y,
      mood: "idle",
      bubble: "摸摸我？",
      sprite: "",
      moveMs: 1200,
      dir: 1,
      floor: places.rug.floor
    }
  },

  onLoad() {
    this.centerScene();
    this.startCatLoop();
  },

  centerScene() {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const sceneWidth = Math.max(info.windowWidth, info.windowHeight * roomBg.width / roomBg.height);
    const scrollLeft = Math.max(0, (sceneWidth - info.windowWidth) * 0.5);

    this.setData({
      sceneScrollLeft: scrollLeft,
      sceneWidthStyle: `width: ${sceneWidth}px; min-width: ${sceneWidth}px; max-width: ${sceneWidth}px;`
    });
  },

  onUnload() {
    if (this.catTimer) clearTimeout(this.catTimer);
  },

  onHotspotTap(event) {
    const target = event.currentTarget.dataset.target;
    if (!target) return;
    wx.navigateTo({ url: target });
  },

  openCat() {
    wx.navigateTo({ url: "/pages/cat/cat" });
  },

  startCatLoop() {
    const run = () => {
      const behavior = routine[this.routineIndex % routine.length];
      this.routineIndex += 1;

      const current = this.data.cat;
      const target = places[behavior.place] || places.rug;
      const route = buildCatRoute(current, target);

      const applyAction = () => {
        this.setData({
          cat: {
            ...this.data.cat,
            x: target.x,
            y: target.y,
            floor: target.floor,
            mood: behavior.mood,
            bubble: behavior.text,
            moveMs: 0,
            dir: target.x >= current.x ? 1 : -1
          }
        });
        this.catTimer = setTimeout(run, behavior.stay);
      };

      if (!route.length) {
        applyAction();
        return;
      }

      const walkSegment = (index) => {
        if (index >= route.length) {
          applyAction();
          return;
        }

        const previous = this.data.cat;
        const step = route[index];
        const moveMs = getSegmentDuration(previous, step);
        const dir = step.x >= previous.x ? 1 : -1;

        this.setData({
          cat: {
            ...previous,
            x: step.x,
            y: step.y,
            floor: step.floor || inferFloor(step),
            mood: "walk",
            bubble: behavior.moveText,
            moveMs,
            dir
          }
        });

        this.catTimer = setTimeout(() => walkSegment(index + 1), moveMs + 90);
      };

      walkSegment(0);
    };

    this.catTimer = setTimeout(run, 1500);
  }
});
