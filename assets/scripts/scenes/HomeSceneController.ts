import {
  _decorator,
  Component,
  Node,
  Label,
  Sprite,
  Button,
  UITransform,
  Color,
  Vec3,
  tween,
  UIOpacity,
  Graphics,
  EventTouch,
  resources,
  SpriteFrame,
  view,
  screen,
  Size,
} from 'cc';
const { ccclass, property } = _decorator;

interface HomeState {
  nickname: string;
  cans: number;
  intimacy: number;
  degree: string;
  catName: string;
  catDesc: string;
}

type PageKey = 'home' | 'study' | 'trade' | 'growth' | 'profile';

interface AssetSpec {
  label: string;
  formalPath: string;
  resourcePath: string;
}

interface RectSpec {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FontSpec {
  title: number;
  subtitle: number;
  cardTitle: number;
  body: number;
  nav: number;
}

interface HomeLayout {
  width: number;
  height: number;
  padding: number;
  safeTop: number;
  safeBottom: number;
  contentWidth: number;
  titleY: number;
  subtitleY: number;
  statusCard: RectSpec;
  roomCard: RectSpec;
  catInfoCard: RectSpec;
  actionBar: RectSpec;
  lowerPanel: RectSpec;
  bottomNav: RectSpec;
  fonts: FontSpec;
}

const ASSETS: Record<string, AssetSpec> = {
  homeRoom: {
    label: 'home_room.png',
    formalPath: 'assets/resources/textures/bg/home_room.png',
    resourcePath: 'textures/bg/home_room/spriteFrame',
  },
  catIdle: {
    label: 'cat_orange_idle.png',
    formalPath: 'assets/resources/textures/cats/cat_orange_idle.png',
    resourcePath: 'textures/cats/cat_orange_idle/spriteFrame',
  },
  catHappy: {
    label: 'cat_orange_happy.png',
    formalPath: 'assets/resources/textures/cats/cat_orange_happy.png',
    resourcePath: 'textures/cats/cat_orange_happy/spriteFrame',
  },
  catEat: {
    label: 'cat_orange_eat.png',
    formalPath: 'assets/resources/textures/cats/cat_orange_eat.png',
    resourcePath: 'textures/cats/cat_orange_eat/spriteFrame',
  },
  can: {
    label: 'can.png',
    formalPath: 'assets/resources/textures/icons/can.png',
    resourcePath: 'textures/icons/can/spriteFrame',
  },
};

@ccclass('HomeSceneController')
export class HomeSceneController extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  subtitleLabel: Label | null = null;

  @property(Label)
  nicknameLabel: Label | null = null;

  @property(Label)
  cansLabel: Label | null = null;

  @property(Label)
  intimacyLabel: Label | null = null;

  @property(Label)
  degreeLabel: Label | null = null;

  @property(Node)
  catNode: Node | null = null;

  @property(Label)
  catNameLabel: Label | null = null;

  @property(Label)
  catDescLabel: Label | null = null;

  @property(Node)
  intimacyProgressNode: Node | null = null;

  @property(Button)
  touchCatButton: Button | null = null;

  @property(Button)
  feedButton: Button | null = null;

  @property(Button)
  plantButton: Button | null = null;

  @property(Button)
  harvestButton: Button | null = null;

  @property(Label)
  toastLabel: Label | null = null;

  private readonly state: HomeState = {
    nickname: '种猫新手',
    cans: 128,
    intimacy: 36,
    degree: '喵喵生预备役',
    catName: '阿橘',
    catDesc: '橘猫 · ENFJ · 暖心大姐姐',
  };

  private layout: HomeLayout | null = null;
  private catSprite: Sprite | null = null;
  private roomSprite: Sprite | null = null;
  private catFallbackNode: Node | null = null;
  private canIconSprite: Sprite | null = null;
  private canIconFallbackNode: Node | null = null;
  private roomFallbackNode: Node | null = null;
  private toastOpacity: UIOpacity | null = null;
  private catFrames: Partial<Record<'idle' | 'happy' | 'eat', SpriteFrame>> = {};
  private roomImageMax = new Size(1, 1);
  private catImageMax = new Size(1, 1);
  private canIconMax = new Size(1, 1);
  private loadedPngCount = 0;
  private currentPage: PageKey = 'home';
  private lowerPanelTitle: Label | null = null;
  private lowerPanelDesc: Label | null = null;
  private navItems: Array<{ key: PageKey; bg: Node; label: Label }> = [];

  protected start(): void {
    this.layout = this.createLayout();
    const device = screen.windowSize;
    console.log(`[HomeScene] visibleSize: ${this.layout.width} x ${this.layout.height}; screen: ${device.width} x ${device.height}`);

    if (!this.hasRequiredBindings()) this.buildRuntimeUI(this.layout);
    this.refreshLabels();
    this.hideToast();
    this.playCatBreathing();
    this.loadOptionalAssets();
    console.log('[HomeScene] layout ready');
  }

  onTouchCat(event?: EventTouch): void {
    this.state.intimacy += 1;
    this.refreshLabels();
    this.showToast('阿橘蹭了蹭你的手～');
    this.setCatFrame('happy', 0.8);
    this.playCatBounce();
  }

  onFeedCat(event?: EventTouch): void {
    if (this.state.cans <= 0) {
      this.showToast('罐头不够啦，去学习赚一点吧');
      return;
    }

    this.state.cans -= 1;
    this.state.intimacy += 2;
    this.refreshLabels();
    this.showToast('阿橘吃得很开心！');
    this.setCatFrame('eat', 1);
    this.playCatFeedScale();
  }

  onPlantSeed(event?: EventTouch): void {
    if (this.state.cans < 20) {
      this.showToast('还需要更多猫罐头哦');
      return;
    }

    this.state.cans -= 20;
    this.refreshLabels();
    this.showToast('小猫种子已经种下啦');
  }

  onHarvestCat(event?: EventTouch): void {
    this.showToast('小猫还在慢慢长大哦');
  }

  private createLayout(): HomeLayout {
    const visibleSize = view.getVisibleSize();
    const width = visibleSize.width;
    const height = visibleSize.height;
    const padding = width * 0.06;
    const contentWidth = width - padding * 2;
    const gap = this.clamp(height * 0.012, 14, 22);
    const statusH = this.clamp(height * 0.105, 96, 168);
    const roomH = this.clamp(height * 0.38, 430, 640);
    const infoH = this.clamp(height * 0.085, 88, 138);
    const actionH = this.clamp(height * 0.056, 48, 76);
    const navH = this.clamp(height * 0.064, 68, 92);
    const titleY = height / 2 - this.clamp(height * 0.075, 72, 122);
    const subtitleY = titleY - this.clamp(height * 0.03, 32, 48);
    const statusCard: RectSpec = { x: 0, y: subtitleY - this.clamp(height * 0.055, 52, 86), w: contentWidth, h: statusH };
    const bottomNav: RectSpec = { x: 0, y: -height / 2 + this.clamp(height * 0.052, 48, 64), w: contentWidth, h: navH };
    const roomY = statusCard.y - statusH / 2 - gap - roomH / 2;
    const infoY = roomY - roomH / 2 - gap - infoH / 2;
    const actionY = infoY - infoH / 2 - gap - actionH / 2;
    const lowerTop = actionY - actionH / 2 - gap;
    const lowerBottom = bottomNav.y + navH / 2 + gap;
    const lowerH = Math.max(96, lowerTop - lowerBottom);
    const lowerPanel: RectSpec = { x: 0, y: lowerBottom + lowerH / 2, w: contentWidth, h: lowerH };
    const roomCard: RectSpec = { x: 0, y: roomY, w: contentWidth, h: roomH };
    const catInfoCard: RectSpec = { x: 0, y: infoY, w: contentWidth, h: infoH };
    const actionBar: RectSpec = { x: 0, y: actionY, w: contentWidth, h: actionH };

    return {
      width,
      height,
      padding,
      safeTop: height / 2 - padding,
      safeBottom: -height / 2 + padding,
      contentWidth,
      titleY,
      subtitleY,
      statusCard,
      roomCard,
      catInfoCard,
      actionBar,
      bottomNav,
      fonts: {
        title: this.clamp(width * 0.07, 28, 52),
        subtitle: this.clamp(width * 0.044, 18, 32),
        cardTitle: this.clamp(width * 0.052, 20, 38),
        body: this.clamp(width * 0.044, 18, 30),
        nav: this.clamp(width * 0.034, 14, 22),
      },
      lowerPanel,
    };
  }

  private hasRequiredBindings(): boolean {
    return !!(
      this.titleLabel &&
      this.subtitleLabel &&
      this.nicknameLabel &&
      this.cansLabel &&
      this.intimacyLabel &&
      this.degreeLabel &&
      this.catNode &&
      this.catNameLabel &&
      this.catDescLabel &&
      this.intimacyProgressNode &&
      this.touchCatButton &&
      this.feedButton &&
      this.plantButton &&
      this.harvestButton &&
      this.toastLabel
    );
  }

  private buildRuntimeUI(layout: HomeLayout): void {
    const homeRoot = this.createNode('HomeRoot', this.node, 0, 0, layout.width, layout.height);

    this.createPanel('Background', homeRoot, 0, 0, layout.width, layout.height, '#FFF7E8', 0, false);
    this.createClayBubble(homeRoot, -layout.width * 0.38, layout.height * 0.36, layout.width * 0.24, '#FFFFFF', 40);
    this.createClayBubble(homeRoot, layout.width * 0.42, layout.height * 0.39, layout.width * 0.17, '#FFE1DE', 34);
    this.createClayBubble(homeRoot, -layout.width * 0.44, -layout.height * 0.38, layout.width * 0.2, '#DDEED1', 28);

    this.titleLabel = this.createLabel('TitleLabel', homeRoot, '我的猫舍', 0, layout.titleY, layout.fonts.title, '#3E342E', true, 'center', layout.contentWidth);
    this.subtitleLabel = this.createLabel('SubtitleLabel', homeRoot, '今天也要和阿橘一起慢慢变富呀', 0, layout.subtitleY, layout.fonts.subtitle, '#9B8A7D', false, 'center', layout.contentWidth);

    const statusCard = this.createPanel('StatusCard', homeRoot, layout.statusCard.x, layout.statusCard.y, layout.statusCard.w, layout.statusCard.h, '#FFF8EA', layout.statusCard.h * 0.28);
    const avatarSize = layout.statusCard.h * 0.58;
    this.createAvatar(statusCard, -layout.statusCard.w / 2 + avatarSize * 0.82, 0, avatarSize, layout.fonts.cardTitle);
    const leftX = -layout.statusCard.w / 2 + avatarSize * 1.55;
    this.nicknameLabel = this.createLabel('NicknameLabel', statusCard, '', leftX, layout.statusCard.h * 0.24, layout.fonts.cardTitle, '#3E342E', true, 'left', layout.statusCard.w * 0.46);
    this.degreeLabel = this.createLabel('DegreeLabel', statusCard, '', leftX, -2, layout.fonts.subtitle, '#F06F6F', false, 'left', layout.statusCard.w * 0.46);
    const canSize = this.clamp(layout.statusCard.h * 0.26, 24, 34);
    this.canIconMax = new Size(canSize, canSize);
    this.canIconFallbackNode = this.createFallbackCan(statusCard, leftX, -layout.statusCard.h * 0.28, canSize * 0.86);
    this.canIconSprite = this.createSpriteNode('CanSprite', statusCard, leftX, -layout.statusCard.h * 0.28, canSize, canSize).getComponent(Sprite);
    if (this.canIconSprite?.node) this.canIconSprite.node.active = false;
    this.cansLabel = this.createLabel('CansLabel', statusCard, '', leftX + canSize * 0.72, -layout.statusCard.h * 0.28, layout.fonts.body, '#3E342E', true, 'left', layout.statusCard.w * 0.3);
    this.intimacyLabel = this.createLabel('IntimacyLabel', statusCard, '', layout.statusCard.w / 2 - layout.padding * 0.35, -layout.statusCard.h * 0.28, layout.fonts.body, '#3E342E', true, 'right', layout.statusCard.w * 0.34);

    const roomCard = this.createPanel('RoomCard', homeRoot, layout.roomCard.x, layout.roomCard.y, layout.roomCard.w, layout.roomCard.h, '#FFF8EA', Math.min(34, layout.roomCard.h * 0.1));
    const roomInset = layout.padding * 0.55;
    this.roomImageMax = new Size(layout.roomCard.w - roomInset * 2, layout.roomCard.h - roomInset * 2);
    this.roomFallbackNode = this.createRoomFallback(roomCard, this.roomImageMax.width, this.roomImageMax.height);
    const roomSpriteNode = this.createSpriteNode('HomeRoomSprite', roomCard, 0, 0, this.roomImageMax.width, this.roomImageMax.height);
    roomSpriteNode.active = false;
    this.roomSprite = roomSpriteNode.getComponent(Sprite);

    const catSize = this.clamp(layout.roomCard.h * 0.45, 118, layout.roomCard.h * 0.48);
    this.catImageMax = new Size(catSize, catSize);
    const catX = layout.roomCard.w * 0.23;
    const catY = -layout.roomCard.h * 0.22;
    this.createPanel('CatShadow', roomCard, catX, catY - catSize * 0.44, catSize * 0.78, catSize * 0.13, '#8A5D3A', catSize * 0.08, false, 48);
    this.catNode = this.createCat(roomCard, catX, catY, catSize);

    const catInfoCard = this.createPanel('CatInfoCard', homeRoot, layout.catInfoCard.x, layout.catInfoCard.y, layout.catInfoCard.w, layout.catInfoCard.h, '#FFF8EA', layout.catInfoCard.h * 0.28);
    this.catNameLabel = this.createLabel('CatNameLabel', catInfoCard, '', -layout.catInfoCard.w / 2 + layout.padding * 0.5, layout.catInfoCard.h * 0.23, layout.fonts.cardTitle, '#3E342E', true, 'left', layout.catInfoCard.w * 0.78);
    this.catDescLabel = this.createLabel('CatDescLabel', catInfoCard, '', -layout.catInfoCard.w / 2 + layout.padding * 0.5, -4, layout.fonts.subtitle, '#9B8A7D', false, 'left', layout.catInfoCard.w * 0.78);
    const progressW = layout.catInfoCard.w - layout.padding;
    this.createPanel('IntimacyProgressBg', catInfoCard, 0, -layout.catInfoCard.h * 0.33, progressW, 10, '#F4E4CF', 5, false);
    this.intimacyProgressNode = this.createPanel('IntimacyProgressFill', catInfoCard, -progressW / 2, -layout.catInfoCard.h * 0.33, progressW, 10, '#FF8A8A', 5, false);
    this.intimacyProgressNode.getComponent(UITransform)?.setAnchorPoint(0, 0.5);

    const actionButtons = this.createNode('ActionButtons', homeRoot, layout.actionBar.x, layout.actionBar.y, layout.actionBar.w, layout.actionBar.h);
    const gap = this.clamp(layout.width * 0.028, 10, 12);
    const buttonH = this.clamp(layout.actionBar.h, 46, 52);
    const buttonW = (layout.actionBar.w - gap * 3) / 4;
    const startX = -layout.actionBar.w / 2 + buttonW / 2;
    this.touchCatButton = this.createButton('TouchCatButton', actionButtons, '撸猫', startX, 0, buttonW, buttonH, '#FF8A8A', () => this.onTouchCat(), layout.fonts.body);
    this.feedButton = this.createButton('FeedButton', actionButtons, '喂罐头', startX + (buttonW + gap), 0, buttonW, buttonH, '#FFF0B8', () => this.onFeedCat(), layout.fonts.body);
    this.plantButton = this.createButton('PlantButton', actionButtons, '种小猫', startX + (buttonW + gap) * 2, 0, buttonW, buttonH, '#DDEED1', () => this.onPlantSeed(), layout.fonts.body);
    this.harvestButton = this.createButton('HarvestButton', actionButtons, '收获', startX + (buttonW + gap) * 3, 0, buttonW, buttonH, '#FFE1DE', () => this.onHarvestCat(), layout.fonts.body);

    const lowerPanel = this.createPanel('RuntimePagePanel', homeRoot, layout.lowerPanel.x, layout.lowerPanel.y, layout.lowerPanel.w, layout.lowerPanel.h, '#FFF8EA', Math.min(30, layout.lowerPanel.h * 0.16));
    this.lowerPanelTitle = this.createLabel('RuntimePageTitle', lowerPanel, '', -layout.lowerPanel.w / 2 + layout.padding * 0.5, layout.lowerPanel.h * 0.25, layout.fonts.cardTitle, '#3E342E', true, 'left', layout.lowerPanel.w * 0.82);
    this.lowerPanelDesc = this.createLabel('RuntimePageDesc', lowerPanel, '', -layout.lowerPanel.w / 2 + layout.padding * 0.5, layout.lowerPanel.h * 0.02, layout.fonts.body, '#9B8A7D', false, 'left', layout.lowerPanel.w * 0.82);
    this.createLabel('RuntimePageHint', lowerPanel, '底部导航可切换页面预览', 0, -layout.lowerPanel.h * 0.28, layout.fonts.nav, '#C4AFA0', false, 'center', layout.lowerPanel.w * 0.82);

    const bottomNav = this.createPanel('BottomNav', homeRoot, layout.bottomNav.x, layout.bottomNav.y, layout.bottomNav.w, layout.bottomNav.h, '#FFF8EA', layout.bottomNav.h * 0.32);
    this.navItems = [];
    ([
      ['home', '猫舍'],
      ['study', '学习'],
      ['trade', '实验田'],
      ['growth', '成长金'],
      ['profile', '我的'],
    ] as Array<[PageKey, string]>).forEach(([key, item], index) => {
      const itemW = layout.bottomNav.w * 0.18;
      const x = -layout.bottomNav.w * 0.4 + index * (layout.bottomNav.w * 0.2);
      const bg = this.createPanel(`BottomNav${index}Bg`, bottomNav, x, 0, itemW, layout.bottomNav.h * 0.58, '#FFE1DE', layout.bottomNav.h * 0.2, false, key === 'home' ? 255 : 0);
      const label = this.createLabel(`BottomNav${index}`, bottomNav, item, x, -2, layout.fonts.nav, key === 'home' ? '#F06F6F' : '#9B8A7D', key === 'home', 'center', itemW);
      const button = bg.addComponent(Button);
      button.transition = Button.Transition.SCALE;
      button.zoomScale = 0.96;
      bg.on(Button.EventType.CLICK, () => this.switchPage(key), this);
      this.navItems.push({ key, bg, label });
    });

    const toastPanel = this.createPanel('ToastLabel', homeRoot, 0, layout.bottomNav.y + layout.bottomNav.h * 0.95, layout.contentWidth * 0.75, this.clamp(layout.height * 0.052, 44, 58), '#3E342E', 29, false, 230);
    this.toastOpacity = toastPanel.addComponent(UIOpacity);
    this.toastOpacity.opacity = 0;
    this.toastLabel = this.createLabel('ToastText', toastPanel, '', 0, 0, layout.fonts.body, '#FFFFFF', true, 'center', layout.contentWidth * 0.7);
    this.switchPage('home', false);
  }

  private switchPage(page: PageKey, showToast = true): void {
    this.currentPage = page;
    const copy: Record<PageKey, { title: string; subtitle: string; panelTitle: string; panelDesc: string }> = {
      home: {
        title: '我的猫舍',
        subtitle: '今天也要和阿橘一起慢慢变富呀',
        panelTitle: '今日小目标',
        panelDesc: '撸猫、喂罐头、学习一小节，让阿橘慢慢长大。',
      },
      study: {
        title: '喵园课堂',
        subtitle: '刷一节小课，喂一口罐头',
        panelTitle: '学习赚罐头',
        panelDesc: '这里会放课程卡片。完成课程后获得猫罐头奖励。',
      },
      trade: {
        title: '实验田',
        subtitle: '模拟体验，不构成投资建议',
        panelTitle: '模拟交易练习',
        panelDesc: '选择一个 ETF 主题，让阿橘用模拟盘练手。',
      },
      growth: {
        title: '成长金',
        subtitle: '只记录成长，不触碰真实资金',
        panelTitle: '合规说明',
        panelDesc: '平台不触碰用户资金，不展示真实余额，不承诺收益。',
      },
      profile: {
        title: '我的',
        subtitle: '小猫、徽章和慢慢变好的自己',
        panelTitle: '图鉴与成就',
        panelDesc: '这里会展示小猫图鉴、学习天数和已解锁徽章。',
      },
    };

    const data = copy[page];
    if (this.titleLabel) this.titleLabel.string = data.title;
    if (this.subtitleLabel) this.subtitleLabel.string = data.subtitle;
    if (this.lowerPanelTitle) this.lowerPanelTitle.string = data.panelTitle;
    if (this.lowerPanelDesc) this.lowerPanelDesc.string = data.panelDesc;

    this.navItems.forEach((item) => {
      const active = item.key === page;
      item.label.color = this.hex(active ? '#F06F6F' : '#9B8A7D');
      item.label.isBold = active;
      const graphics = item.bg.getComponent(Graphics);
      const transform = item.bg.getComponent(UITransform);
      if (graphics && transform) {
        this.drawRoundRect(graphics, transform.width, transform.height, transform.height * 0.35, this.hex('#FFE1DE', active ? 255 : 0));
      }
    });

    if (showToast && page !== 'home') this.showToast(`${data.title}页面预览`);
  }

  private loadOptionalAssets(): void {
    this.loadSpriteFrame(ASSETS.homeRoom, (frame) => {
      if (!this.roomSprite || !frame) return;
      this.roomSprite.spriteFrame = frame;
      this.roomSprite.sizeMode = Sprite.SizeMode.CUSTOM;
      this.applyContainSize(this.roomSprite.node, frame, this.roomImageMax.width, this.roomImageMax.height);
      this.roomSprite.node.active = true;
      if (this.roomFallbackNode) this.roomFallbackNode.active = false;
    });

    this.loadSpriteFrame(ASSETS.catIdle, (frame) => {
      if (!frame || !this.catSprite) return;
      this.catFrames.idle = frame;
      this.catSprite.spriteFrame = frame;
      this.catSprite.sizeMode = Sprite.SizeMode.CUSTOM;
      this.applyContainSize(this.catSprite.node, frame, this.catImageMax.width, this.catImageMax.height);
      this.catSprite.node.active = true;
      if (this.catFallbackNode) this.catFallbackNode.active = false;
    });

    this.loadSpriteFrame(ASSETS.catHappy, (frame) => {
      if (frame) this.catFrames.happy = frame;
    });

    this.loadSpriteFrame(ASSETS.catEat, (frame) => {
      if (frame) this.catFrames.eat = frame;
    });

    this.loadSpriteFrame(ASSETS.can, (frame) => {
      if (!frame || !this.canIconSprite) return;
      this.canIconSprite.spriteFrame = frame;
      this.canIconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
      this.applyContainSize(this.canIconSprite.node, frame, this.canIconMax.width, this.canIconMax.height);
      this.canIconSprite.node.active = true;
      if (this.canIconFallbackNode) this.canIconFallbackNode.active = false;
    });
  }

  private loadSpriteFrame(asset: AssetSpec, onLoaded: (frame: SpriteFrame | null) => void): void {
    resources.load(asset.resourcePath, SpriteFrame, (error, frame) => {
      if (error || !frame) {
        console.warn(`[HomeSceneController] 加载失败 ${asset.label}: ${asset.formalPath}，使用 fallback。`);
        onLoaded(null);
        this.logAssetMode();
        return;
      }
      this.loadedPngCount += 1;
      console.log(`[HomeSceneController] 成功加载 ${asset.label}: ${asset.formalPath}`);
      onLoaded(frame);
      this.logAssetMode();
    });
  }

  private logAssetMode(): void {
    console.log(`[HomeScene] using ${this.loadedPngCount > 0 ? 'PNG assets' : 'fallback'}`);
  }

  private applyContainSize(node: Node, frame: SpriteFrame, maxWidth: number, maxHeight: number): void {
    const data = frame as unknown as { originalSize?: { width: number; height: number }; rect?: { width: number; height: number } };
    const sourceWidth = data.originalSize?.width || data.rect?.width || maxWidth;
    const sourceHeight = data.originalSize?.height || data.rect?.height || maxHeight;
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
    node.getComponent(UITransform)?.setContentSize(Math.max(1, sourceWidth * scale), Math.max(1, sourceHeight * scale));
  }

  private createNode(name: string, parent: Node, x: number, y: number, width: number, height: number): Node {
    const node = new Node(name);
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    return node;
  }

  private createSpriteNode(name: string, parent: Node, x: number, y: number, width: number, height: number): Node {
    const node = this.createNode(name, parent, x, y, width, height);
    node.addComponent(Sprite);
    return node;
  }

  private createPanel(name: string, parent: Node, x: number, y: number, width: number, height: number, color: string, radius: number, shadow = true, alpha = 255): Node {
    if (shadow) this.createPanel(`${name}Shadow`, parent, x, y - Math.min(10, height * 0.08), width, height, '#6B4A35', radius, false, 24);
    const node = this.createNode(name, parent, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    this.drawRoundRect(graphics, width, height, radius, this.hex(color, alpha));
    return node;
  }

  private createLabel(
    name: string,
    parent: Node,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    bold = false,
    align: 'left' | 'center' | 'right' = 'center',
    width = 600,
  ): Label {
    const node = this.createNode(name, parent, x, y, width, fontSize + 16);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.color = this.hex(color);
    label.isBold = bold;
    if (align === 'left') label.horizontalAlign = Label.HorizontalAlign.LEFT;
    if (align === 'center') label.horizontalAlign = Label.HorizontalAlign.CENTER;
    if (align === 'right') label.horizontalAlign = Label.HorizontalAlign.RIGHT;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    return label;
  }

  private createButton(name: string, parent: Node, text: string, x: number, y: number, width: number, height: number, color: string, handler: () => void, fontSize: number): Button {
    const node = this.createPanel(name, parent, x, y, width, height, color, height / 2, true);
    const button = node.addComponent(Button);
    button.transition = Button.Transition.SCALE;
    button.zoomScale = 0.96;
    node.on(Button.EventType.CLICK, () => {
      tween(node).stop();
      tween(node).to(0.06, { scale: new Vec3(0.96, 0.96, 1) }).to(0.12, { scale: Vec3.ONE }).start();
      handler();
    }, this);
    this.createLabel(`${name}Label`, node, text, 0, 0, fontSize, '#3E342E', true, 'center', width - 8);
    return button;
  }

  private createAvatar(parent: Node, x: number, y: number, size: number, fontSize: number): void {
    const avatar = this.createPanel('AvatarNode', parent, x, y, size, size, '#FFE1DE', size / 2, false);
    this.createLabel('AvatarText', avatar, '爪', 0, 0, fontSize, '#F06F6F', true, 'center', size);
  }

  private createRoomFallback(parent: Node, width: number, height: number): Node {
    const root = this.createNode('FallbackRoom', parent, 0, 0, width, height);
    this.createPanel('RoomBg', root, 0, 0, width, height, '#FFE8C8', Math.min(30, height * 0.1), false);
    this.createPanel('Floor', root, 0, -height * 0.33, width * 0.94, height * 0.25, '#D89C5B', height * 0.07, false);
    this.createPanel('Window', root, -width * 0.3, height * 0.22, width * 0.28, height * 0.24, '#DDF2FF', height * 0.05, false);
    this.createPanel('CurtainL', root, -width * 0.39, height * 0.22, width * 0.07, height * 0.26, '#C7E2DE', height * 0.04, false);
    this.createPanel('CurtainR', root, -width * 0.21, height * 0.22, width * 0.07, height * 0.26, '#C7E2DE', height * 0.04, false);
    this.createPanel('Desk', root, -width * 0.3, -height * 0.18, width * 0.3, height * 0.14, '#C98A52', height * 0.04, false);
    this.createPanel('CatBed', root, -width * 0.4, -height * 0.34, width * 0.22, height * 0.13, '#FFF8EA', height * 0.06, false);
    this.createPanel('PlantPot', root, width * 0.38, -height * 0.2, width * 0.09, height * 0.11, '#D89C5B', height * 0.03, false);
    const plant = this.createNode('Plant', root, width * 0.38, -height * 0.08, width * 0.15, height * 0.18);
    const g = plant.addComponent(Graphics);
    g.strokeColor = this.hex('#7CBF8A');
    g.lineWidth = Math.max(4, width * 0.012);
    g.moveTo(0, -height * 0.07);
    g.lineTo(0, height * 0.06);
    g.moveTo(0, 0);
    g.quadraticCurveTo(-width * 0.07, height * 0.04, -width * 0.09, -height * 0.02);
    g.moveTo(0, height * 0.02);
    g.quadraticCurveTo(width * 0.08, height * 0.06, width * 0.09, -height * 0.01);
    g.stroke();
    return root;
  }

  private createCat(parent: Node, x: number, y: number, size: number): Node {
    const node = this.createNode('CatNode', parent, x, y, size, size);
    const spriteNode = this.createSpriteNode('CatSprite', node, 0, 0, size, size);
    spriteNode.active = false;
    this.catSprite = spriteNode.getComponent(Sprite);
    this.catFallbackNode = this.createFallbackCat(node, size);
    return node;
  }

  private createFallbackCat(parent: Node, size: number): Node {
    const node = this.createNode('FallbackCat', parent, 0, 0, size, size);
    const g = node.addComponent(Graphics);
    const s = size / 240;

    g.fillColor = this.hex('#8A5D3A', 56);
    g.ellipse(0, -92 * s, 92 * s, 20 * s);
    g.fill();

    g.strokeColor = this.hex('#E99B57');
    g.lineWidth = 24 * s;
    g.arc(62 * s, -10 * s, 58 * s, -0.35, 1.44, false);
    g.stroke();

    g.fillColor = this.hex('#F7B36E');
    g.ellipse(0, -40 * s, 64 * s, 74 * s);
    g.fill();

    g.fillColor = this.hex('#FFF5E5');
    g.ellipse(-8 * s, -44 * s, 44 * s, 58 * s);
    g.fill();

    g.fillColor = this.hex('#F4A05B');
    g.circle(0, 50 * s, 68 * s);
    g.fill();

    g.moveTo(-44 * s, 94 * s);
    g.lineTo(-22 * s, 146 * s);
    g.lineTo(-6 * s, 88 * s);
    g.close();
    g.moveTo(44 * s, 94 * s);
    g.lineTo(22 * s, 146 * s);
    g.lineTo(6 * s, 88 * s);
    g.close();
    g.fill();

    g.fillColor = this.hex('#FFF5E5');
    g.ellipse(0, 38 * s, 44 * s, 38 * s);
    g.fill();

    g.fillColor = this.hex('#3E342E');
    g.circle(-23 * s, 56 * s, 8 * s);
    g.circle(23 * s, 56 * s, 8 * s);
    g.fill();

    g.fillColor = this.hex('#FF8A8A');
    g.circle(0, 40 * s, 5 * s);
    g.fill();

    g.strokeColor = this.hex('#3E342E');
    g.lineWidth = 3 * s;
    g.moveTo(0, 34 * s);
    g.quadraticCurveTo(-13 * s, 22 * s, -25 * s, 30 * s);
    g.moveTo(0, 34 * s);
    g.quadraticCurveTo(13 * s, 22 * s, 25 * s, 30 * s);
    g.stroke();

    return node;
  }

  private createFallbackCan(parent: Node, x: number, y: number, size: number): Node {
    const node = this.createNode('CanFallback', parent, x, y, size, size);
    const g = node.addComponent(Graphics);
    g.fillColor = this.hex('#B6DCD8');
    g.roundRect(-size * 0.42, -size * 0.28, size * 0.84, size * 0.56, size * 0.22);
    g.fill();
    g.strokeColor = this.hex('#8C7560');
    g.lineWidth = Math.max(2, size * 0.08);
    g.ellipse(0, size * 0.27, size * 0.42, size * 0.12);
    g.stroke();
    return node;
  }

  private createClayBubble(parent: Node, x: number, y: number, size: number, color: string, alpha: number): void {
    const node = this.createNode('ClayBubble', parent, x, y, size, size);
    const g = node.addComponent(Graphics);
    g.fillColor = this.hex(color, alpha);
    g.circle(0, 0, size / 2);
    g.fill();
  }

  private refreshLabels(): void {
    if (this.titleLabel) this.titleLabel.string = '我的猫舍';
    if (this.subtitleLabel) this.subtitleLabel.string = '今天也要和阿橘一起慢慢变富呀';
    if (this.nicknameLabel) this.nicknameLabel.string = this.state.nickname;
    if (this.cansLabel) this.cansLabel.string = `猫罐头 ${this.state.cans}`;
    if (this.intimacyLabel) this.intimacyLabel.string = `亲密度 ${this.state.intimacy}`;
    if (this.degreeLabel) this.degreeLabel.string = this.state.degree;
    if (this.catNameLabel) this.catNameLabel.string = this.state.catName;
    if (this.catDescLabel) this.catDescLabel.string = this.state.catDesc;

    if (this.intimacyProgressNode) {
      const progress = Math.max(0, Math.min(1, this.state.intimacy / 100));
      this.intimacyProgressNode.setScale(new Vec3(progress, 1, 1));
    }
  }

  private setCatFrame(state: 'idle' | 'happy' | 'eat', duration = 0): void {
    const frame = this.catFrames[state];
    if (!frame || !this.catSprite) return;

    this.catSprite.spriteFrame = frame;
    this.applyContainSize(this.catSprite.node, frame, this.catImageMax.width, this.catImageMax.height);
    if (duration > 0) {
      this.unschedule(this.resetCatIdleFrame);
      this.scheduleOnce(this.resetCatIdleFrame, duration);
    }
  }

  private resetCatIdleFrame(): void {
    if (this.catFrames.idle && this.catSprite) {
      this.catSprite.spriteFrame = this.catFrames.idle;
      this.applyContainSize(this.catSprite.node, this.catFrames.idle, this.catImageMax.width, this.catImageMax.height);
    }
  }

  private playCatBreathing(): void {
    if (!this.catNode) return;
    tween(this.catNode).stop();
    this.catNode.setScale(Vec3.ONE);
    tween(this.catNode)
      .to(1.1, { scale: new Vec3(1.03, 1.03, 1) }, { easing: 'sineInOut' })
      .to(1.1, { scale: Vec3.ONE }, { easing: 'sineInOut' })
      .union()
      .repeatForever()
      .start();
  }

  private playCatBounce(): void {
    if (!this.catNode) return;
    const original = this.catNode.position.clone();

    tween(this.catNode).stop();
    tween(this.catNode)
      .to(0.1, { scale: new Vec3(1.1, 1.1, 1), position: new Vec3(original.x, original.y + this.catImageMax.height * 0.07, original.z) }, { easing: 'quadOut' })
      .to(0.16, { scale: Vec3.ONE, position: original }, { easing: 'quadIn' })
      .call(() => this.playCatBreathing())
      .start();
  }

  private playCatFeedScale(): void {
    if (!this.catNode) return;
    tween(this.catNode).stop();
    tween(this.catNode)
      .to(0.12, { scale: new Vec3(1.08, 1.08, 1) }, { easing: 'backOut' })
      .to(0.18, { scale: Vec3.ONE }, { easing: 'sineOut' })
      .call(() => this.playCatBreathing())
      .start();
  }

  private showToast(message: string): void {
    if (!this.toastLabel) return;
    const target = this.toastLabel.node.parent ?? this.toastLabel.node;
    const opacity = this.toastOpacity ?? target.getComponent(UIOpacity) ?? target.addComponent(UIOpacity);
    this.toastOpacity = opacity;

    this.toastLabel.string = message;
    target.active = true;
    opacity.opacity = 0;
    tween(opacity).stop();
    tween(opacity)
      .to(0.14, { opacity: 255 })
      .delay(1.7)
      .to(0.18, { opacity: 0 })
      .call(() => { target.active = false; })
      .start();
  }

  private hideToast(): void {
    if (!this.toastLabel) return;
    const target = this.toastLabel.node.parent ?? this.toastLabel.node;
    target.active = false;
  }

  private drawRoundRect(graphics: Graphics, width: number, height: number, radius: number, color: Color): void {
    graphics.clear();
    graphics.fillColor = color;
    if (radius <= 0) graphics.rect(-width / 2, -height / 2, width, height);
    else graphics.roundRect(-width / 2, -height / 2, width, height, radius);
    graphics.fill();
  }

  private hex(value: string, alpha = 255): Color {
    const text = value.replace('#', '');
    const r = parseInt(text.slice(0, 2), 16);
    const g = parseInt(text.slice(2, 4), 16);
    const b = parseInt(text.slice(4, 6), 16);
    return new Color(r, g, b, alpha);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  protected onDestroy(): void {
    if (this.catNode) tween(this.catNode).stop();
  }
}
