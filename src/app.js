const asset = (name) => `/assets/${name}`;

const icons = {
  book: "📖",
  check: "☑",
  clapper: "▶",
  coin: "🥫",
  door: "🚪",
  heart: "♡",
  home: "🏠",
  note: "✎",
  paw: "🐾",
  pig: "🏦",
  settings: "⚙",
  shirt: "👕",
  sprout: "🌱",
  tv: "📺",
  users: "👥",
  clover: "☘",
  bag: "🛍",
  me: "👤",
};

const hotspots = [
  { id: "tv", icon: "tv", title: "电视", subtitle: "交易", x: 18, y: 44, w: 18, h: 18, panel: "trade", bubble: "这是模拟练习，不是真实投资建议。" },
  { id: "desk", icon: "book", title: "书桌", subtitle: "学习", x: 69, y: 27, w: 20, h: 22, panel: "learn", bubble: "短课和知识树都放在书桌上。" },
  { id: "cat", icon: "paw", title: "猫咪", subtitle: "互动", x: 43, y: 46, w: 21, h: 28, panel: "cat", bubble: "摸摸我？我等下想去写字。" },
  { id: "garden", icon: "sprout", title: "种菜", subtitle: "一楼", x: 13, y: 75, w: 22, h: 15, panel: "garden", bubble: "院子里的菜会慢慢变成猫罐头。" },
  { id: "closet", icon: "door", title: "衣柜", subtitle: "换装", x: 66, y: 73, w: 20, h: 16, panel: "closet", bubble: "现在只有睡衣，先舒服最重要。" },
  { id: "window", icon: "users", title: "窗户", subtitle: "社交", x: 39, y: 20, w: 22, h: 21, panel: "social", bubble: "窗外的小猫在交换日记。", hiddenLabel: true },
  { id: "vault", icon: "pig", title: "小金库", subtitle: "奖励", x: 83, y: 51, w: 12, h: 20, panel: "vault", bubble: "这里只展示猫罐头奖励说明。", hiddenLabel: true },
];

const resources = [
  { icon: "sprout", value: 1280, label: "芽芽" },
  { icon: "clover", value: 36, label: "幸运叶" },
  { icon: "coin", value: 5, label: "罐头" },
];

const sceneCards = [
  { id: "tv", icon: "tv", title: "电视", subtitle: "交易", className: "card-tv" },
  { id: "desk", icon: "book", title: "书桌", subtitle: "学习", className: "card-desk" },
  { id: "cat", icon: "paw", title: "猫咪", subtitle: "互动", className: "card-cat" },
  { id: "garden", icon: "sprout", title: "种菜", subtitle: "", className: "card-garden" },
  { id: "closet", icon: "door", title: "衣柜", subtitle: "换装", className: "card-closet" },
];

const navItems = [
  ["home", "猫舍"],
  ["sprout", "学习"],
  ["bag", "交易"],
  ["users", "社交"],
  ["me", "我"],
];

const catActivities = [
  ["09:20", "小橘自己去院子看了白菜，留下小脚印。"],
  ["12:30", "午休中，梦到一大片猫罐头田。"],
  ["15:10", "写了一张便签：今天学到 ETF 不是一只猫。"],
];

const knowledgeLeaves = [
  ["复利", "fresh"],
  ["货币基金", "fresh"],
  ["ETF", "fresh"],
  ["资产配置", "dim"],
  ["风险分散", "wither"],
  ["长期主义", "dim"],
  ["现金流", "fresh"],
  ["指数基金", "fresh"],
];

const socialPosts = [
  ["团团", "我家的小猫今天主动去菜园巡逻，还给白菜浇水。", "猫猫日常", 18],
  ["咪咪", "小橘写了一张便签：先复盘，再买卖。", "学习心得", 12],
  ["豆豆", "准备把午睡照片发到朋友圈，太治愈了。", "分享灵感", 9],
];

const initialPanel = new URLSearchParams(window.location.search).get("panel");

const state = {
  panel: ["trade", "learn", "cat", "social", "garden", "closet", "vault"].includes(initialPanel) ? initialPanel : null,
  bubble: "摸摸我？",
  agent: { x: 50, y: 64, mood: "idle", dir: 1 },
  debug: false,
  treeMode: "cute",
};

const catSprites = {
  idle: "cat-idle-v6.png",
  walk: "cat-walk-v6.png",
  nap: "cat-nap-v6.png",
  write: "cat-write-v6.png",
  happy: "cat-happy-v6.png",
  cute: "cat-happy-v6.png",
  curious: "cat-idle-v6.png",
  hungry: "cat-idle-v6.png",
};

const catPlaces = {
  rug: { x: 50, y: 64 },
  tv: { x: 29, y: 64 },
  desk: { x: 69, y: 64 },
  window: { x: 50, y: 64 },
  catTree: { x: 80, y: 64 },
};

const catRoutine = [
  { mood: "idle", place: "rug", moveText: "我回地毯坐一会儿。", text: "阳光刚刚好。", stay: 2200 },
  { mood: "idle", place: "window", moveText: "我去窗边看看天气。", text: "外面的树好绿。", stay: 1800 },
  { mood: "write", place: "desk", moveText: "我去书桌写便签。", text: "我写了一张学习便签。", stay: 3200 },
  { mood: "idle", place: "tv", moveText: "我去电视旁看看。", text: "今天的模拟练习要先复盘。", stay: 1800 },
  { mood: "nap", place: "rug", moveText: "我回地毯午休。", text: "午休十分钟，醒来继续陪你。", stay: 3400 },
  { mood: "happy", place: "rug", moveText: "我回你身边。", text: "今天也想和你贴贴。", stay: 2400 },
  { mood: "idle", place: "catTree", moveText: "我去猫爬架伸个懒腰。", text: "伸懒腰完成。", stay: 1800 },
];

let routineIndex = 0;
let routineTimer = null;

const root = document.getElementById("root");

function icon(name, className = "ui-icon") {
  return `<span class="${className}" aria-hidden="true">${icons[name] || name}</span>`;
}

function catFace(extra = "") {
  return `
    <span class="cat-face ${extra}">
      <span class="mini-ear left"></span>
      <span class="mini-ear right"></span>
      <span class="mini-eye left"></span>
      <span class="mini-eye right"></span>
      <span class="mini-nose"></span>
    </span>
  `;
}

function topHud() {
  return `
    <div class="top-hud">
      ${resources.map((item) => `
        <div class="pill" title="${item.label}">
          ${icon(item.icon)}
          <span>${item.value}</span>
          <b>+</b>
        </div>
      `).join("")}
    </div>
  `;
}

function profileCard() {
  return `
    <div class="profile-card">
      <div class="avatar"><img src="${asset("cat-avatar-v6.png")}" alt="" /></div>
      <div>
        <strong>小橘</strong>
        <span>Lv.12 ENFJ</span>
        <div class="progress"><i></i><em>80/170</em></div>
      </div>
    </div>
  `;
}

function sideTools() {
  return `
    <div class="side-tools">
      <button aria-label="任务">${icon("check")}<span>任务</span></button>
      <button aria-label="设置" data-debug class="${state.debug ? "active" : ""}">${icon("settings")}<span>设置</span></button>
    </div>
  `;
}

function agentCat() {
  const { x, y, mood, dir } = state.agent;
  const sprite = catSprites[mood] || catSprites.idle;
  return `
    <button class="agent-cat scene-agent ${mood}" style="left:${x}%;top:${y}%;--dir:${dir}" data-hotspot="cat" aria-label="猫咪互动">
      <span class="cat-bubble">${state.bubble}</span>
      <img class="cat-sprite-img" src="${asset(sprite)}" alt="" />
    </button>
  `;
}

function roomLayers() {
  return `
    <div class="room-layer wall"></div>
    <div class="room-layer floor"></div>
    <div class="room-layer loft"></div>
    <div class="room-layer window-main">
      <i></i><i></i><i></i><i></i>
    </div>
    <div class="room-layer curtain curtain-left"></div>
    <div class="room-layer curtain curtain-right"></div>
    <div class="room-layer tv-stand"></div>
    <div class="room-layer tv-object"><i></i></div>
    <div class="room-layer desk-object">
      <i></i><i></i><i></i>
    </div>
    <div class="room-layer lamp-object"></div>
    <div class="room-layer rug-object"></div>
    <div class="room-layer cat-tree-object"></div>
    <div class="room-layer stair-object"></div>
    <div class="room-layer garden-object"><i></i><i></i><i></i></div>
    <div class="room-layer closet-object"></div>
    <div class="scene-chip chip-tv">电视<br><span>交易</span></div>
    <div class="scene-chip chip-desk">书桌<br><span>学习</span></div>
    <div class="scene-chip chip-cat">猫咪<br><span>互动</span></div>
    <div class="scene-chip chip-garden">种菜</div>
    <div class="scene-chip chip-closet">衣柜<br><span>换装</span></div>
  `;
}

function sceneCardsLayer() {
  return `
    <div class="scene-cards">
      ${sceneCards.map((card) => `
        <button class="scene-card ${card.className}" data-hotspot="${card.id}" aria-label="${card.title}${card.subtitle}">
          ${icon(card.icon, "scene-card-icon")}
          <span><b>${card.title}</b>${card.subtitle ? `<em>${card.subtitle}</em>` : ""}</span>
        </button>
      `).join("")}
    </div>
    <div class="downstairs-note">↓ 一楼区域</div>
  `;
}

function hotspotButton(spot) {
  return `
    <button
      class="hotspot ${state.debug ? "debug" : ""} ${spot.hiddenLabel ? "is-hidden-label" : ""}"
      style="left:${spot.x}%;top:${spot.y}%;width:${spot.w}%;height:${spot.h}%"
      data-hotspot="${spot.id}"
      aria-label="${spot.title}${spot.subtitle}"
    >
      ${state.debug ? `<span class="scene-label debug-label"><span><b>${spot.title}</b><em>${spot.subtitle}</em></span></span>` : ""}
      ${state.debug ? `<i>${spot.id}</i>` : ""}
    </button>
  `;
}

function softNav() {
  return `
    <nav class="soft-nav" aria-label="底部导航">
      ${navItems.map(([name, label], index) => `
        <button class="${index === 0 ? "selected" : ""}" type="button">
          ${icon(name)}
          <span>${label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

function designNote() {
  return `
    <aside class="design-note">
      <h1>猫咪小屋 UI 设计</h1>
      <p>参考《旅行青蛙》设计风格 <span class="note-clover">☘</span></p>
      <div class="note-list">
        <b>点击可交互区域：</b>
        <span>${icon("tv")}电视：交易界面</span>
        <span>${icon("book")}书桌：学习界面</span>
        <span>${icon("paw")}猫咪：互动界面</span>
        <span>${icon("users")}窗户：社交界面</span>
        <span>${icon("sprout")}一楼：种菜 & 换装</span>
      </div>
      <h2>空间结构：</h2>
      <div class="mini-map-wrap">
        <img class="mini-map" src="${asset("space-map.png")}" alt="" />
        <span class="floor-tag second">二楼</span>
        <span class="floor-tag first">一楼</span>
      </div>
    </aside>
  `;
}

function panelPage() {
  if (!state.panel) return "";
  const current = hotspots.find((item) => item.panel === state.panel);
  return `
    <section class="panel panel-${state.panel} in-phone-page">
      <button class="back" data-close aria-label="返回">‹</button>
      ${panelContent(state.panel, current?.title)}
    </section>
  `;
}

function panelContent(panel, title = "") {
  const panels = {
    trade: tradePanel,
    learn: learnPanel,
    cat: catPanel,
    social: socialPanel,
    garden: gardenPanel,
    closet: closetPanel,
    vault: vaultPanel,
  };
  return panels[panel] ? panels[panel]() : `<div class="placeholder">${title} 即将开放</div>`;
}

function tradePanel() {
  return `
    <div class="panel-scene trade-scene inner-page">
      ${topHud()}
      <div class="trade-room">
        <img class="cat-art" src="${asset("cat-idle-v6.png")}" alt="" />
        <p>今天想和我<br>交换点什么呢？</p>
      </div>
      <div class="shop-grid">
        ${[
          ["🐟", "x2", 120],
          ["☘", "x1", 80],
          ["🛍", "x1", 150],
          ["🌱", "", 200],
          ["📦", "", 100],
          ["?", "", 300],
        ].map(([pic, count, price]) => `
          <button class="shop-item"><span>${pic}</span><b>${count}</b><em>${icon("clover")}${price}</em></button>
        `).join("")}
      </div>
      <p class="daily">每日刷新：15:00:00</p>
      <button class="refresh">${icon("clover")} 刷新 10</button>
    </div>
  `;
}

function learnPanel() {
  return `
    <div class="panel-scene learn-scene inner-page">
      ${topHud()}
      <h2>选择要学习的内容</h2>
      <div class="open-book"></div>
      <div class="course-list">
        ${[
          ["🌿", "植物知识", "提升种植效率"],
          ["🥘", "料理技巧", "解锁更多料理"],
          ["📘", "生活常识", "增加旅行收益"],
        ].map(([pic, title, text]) => `
          <article class="course"><span>${pic}</span><div><b>${title}</b><em>${text}</em></div><button>学习<br>${icon("clover")}10</button></article>
        `).join("")}
      </div>
    </div>
  `;
}

function catPanel() {
  return `
    <div class="panel-scene cat-scene inner-page">
      ${topHud()}
      <div class="affinity"><span>亲密度</span><div>♡ ♡ ♡ ♡ ♡</div><em>升级追踪</em></div>
      <img class="panel-big-cat cat-art" src="${asset("cat-happy-v6.png")}" alt="" />
      <div class="interaction-row">
        ${[["👋", "抚摸"], ["🥫", "喂食"], ["🧶", "玩耍"], ["🛁", "洗澡"]].map(([pic, text]) => `<button><span>${pic}</span>${text}</button>`).join("")}
      </div>
      <p class="daily">今日互动次数：3/3</p>
    </div>
  `;
}

function socialPanel() {
  return `
    <div class="panel-scene social-scene inner-page">
      ${topHud()}
      <div class="window-view"></div>
      <section class="friends">
        <h3>我的朋友</h3>
        <div>
          ${["咪咪", "团团", "豆豆"].map((name) => `<span>${catFace("tiny")}<em>${name}</em></span>`).join("")}
        </div>
      </section>
      <section class="feed">
        <h3>好友动态</h3>
      ${socialPosts.map(([name, text, tag, likes]) => `
        <article>
          <strong>${name}</strong>
          <p>${text}</p>
          <div class="post-img"></div>
          <small>♡ ${likes}</small>
        </article>
      `).join("")}
      </section>
    </div>
  `;
}

function gardenPanel() {
  return `
    <div class="panel-scene garden-scene inner-page">
      <h2>种菜界面</h2>
      <div class="plots">
        ${["胡萝卜", "白菜", "番茄"].map((name, index) => `
          <div class="plot"><span class="crop crop-${index}"></span><b>${name}</b></div>
        `).join("")}
      </div>
      <button class="harvest">收获</button>
      <p class="timer">剩余时间：02:45:30</p>
      <h2 class="closet-title">衣柜换装界面</h2>
      <div class="mini-closet">
        <img class="cat-art" src="${asset("cat-happy-v6.png")}" alt="" />
        <div>
          ${["🎩", "🧢", "👕", "🧥"].map((pic) => `<button><span>${pic}</span></button>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function closetPanel() {
  return `
    <div class="panel-scene closet-scene inner-page">
      <h2>衣柜换装界面</h2>
      <img class="dress-cat-img cat-art" src="${asset("cat-happy-v6.png")}" alt="" />
      <div class="clothes">
        ${["🎩", "🧢", "👕", "🧥", "👚", "👔"].map((pic, index) => `<button class="${index ? "" : "selected"}"><span>${pic}</span></button>`).join("")}
      </div>
    </div>
  `;
}

function vaultPanel() {
  return `
    <h2 class="panel-title">猫罐头奖励活动</h2>
    <div class="vault-card">
      ${icon("pig", "vault-icon")}
      <strong>小金库</strong>
      <p>资金操作将在微信官方页面完成，本页只展示活动说明和猫罐头奖励。</p>
    </div>
    <button class="confirm">查看官方入口指引</button>
    <p class="disclaimer">模拟演示页面，不展示真实余额、真实收益或本金。</p>
  `;
}

function render() {
  const phoneContent = state.panel
    ? panelPage()
    : `
        <div class="stage">
          <img class="room-art generated-room" src="${asset("room-generated.png")}" alt="" />
          <div class="coded-room" hidden>${roomLayers()}</div>
          ${profileCard()}
          ${topHud()}
          ${sideTools()}
          ${sceneCardsLayer()}
          ${agentCat()}
          ${hotspots.map(hotspotButton).join("")}
          ${softNav()}
        </div>
      `;
  root.innerHTML = `
    <main class="app-shell">
      <section class="phone-frame ${state.panel ? "panel-frame" : ""}">
        ${phoneContent}
      </section>
      ${designNote()}
    </main>
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-hotspot]").forEach((button) => {
    button.addEventListener("click", () => {
      const spot = hotspots.find((item) => item.id === button.dataset.hotspot);
      if (spot) openPanel(spot);
    });
  });

  document.querySelector("[data-debug]")?.addEventListener("click", () => {
    state.debug = !state.debug;
    render();
  });

  document.querySelector("[data-close]")?.addEventListener("click", () => {
    state.panel = null;
    render();
  });

  document.querySelector("[data-tree-toggle]")?.addEventListener("click", () => {
    state.treeMode = state.treeMode === "cute" ? "science" : "cute";
    render();
  });
}

function updateAgentDom() {
  const node = document.querySelector(".agent-cat");
  if (!node) return;

  node.className = `agent-cat scene-agent ${state.agent.mood}`;
  node.style.left = `${state.agent.x}%`;
  node.style.top = `${state.agent.y}%`;
  node.style.setProperty("--dir", state.agent.dir);
  node.style.setProperty("--move-ms", `${state.agent.moveMs || 1200}ms`);

  const bubble = node.querySelector(".cat-bubble");
  if (bubble) bubble.textContent = state.bubble;

  const sprite = node.querySelector(".cat-sprite-img");
  if (sprite) sprite.src = asset(catSprites[state.agent.mood] || catSprites.idle);
}

function openPanel(spot) {
  state.bubble = spot.bubble;
  state.agent = {
    ...state.agent,
    mood: spot.id === "cat" ? "happy" : state.agent.mood,
  };
  render();
  window.setTimeout(() => {
    state.panel = spot.panel;
    render();
  }, 220);
}

function tickAgent() {
  const next = catRoutine[routineIndex % catRoutine.length];
  routineIndex += 1;

  const target = catPlaces[next.place];
  const oldX = state.agent.x;
  const oldY = state.agent.y;
  const distance = Math.hypot(target.x - oldX, target.y - oldY);
  const moveMs = Math.max(900, Math.min(2200, distance * 95));
  const needsMove = distance > 1;

  const applyAction = () => {
    state.agent = {
      x: target.x,
      y: target.y,
      mood: next.mood,
      dir: target.x >= oldX ? 1 : -1,
      moveMs: 0,
    };
    state.bubble = next.text;
    if (!state.panel) updateAgentDom();
    routineTimer = window.setTimeout(tickAgent, next.stay);
  };

  if (!needsMove) {
    applyAction();
    return;
  }

  state.agent = {
    x: target.x,
    y: target.y,
    mood: "walk",
    dir: target.x >= oldX ? 1 : -1,
    moveMs,
  };
  state.bubble = next.moveText;
  if (!state.panel) updateAgentDom();

  routineTimer = window.setTimeout(applyAction, moveMs + 120);
}

render();
routineTimer = window.setTimeout(tickAgent, 1600);
