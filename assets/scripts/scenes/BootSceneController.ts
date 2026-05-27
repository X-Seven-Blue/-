import { _decorator, Component, Node, Label, ProgressBar as CocosProgressBar, director } from 'cc';
import { GameManager } from '../core/GameManager';
import { StorageManager } from '../core/StorageManager';
import { SceneRouter } from '../core/SceneRouter';
const { ccclass, property } = _decorator;

@ccclass('BootSceneController')
export class BootSceneController extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  @property(CocosProgressBar)
  loadingProgress: CocosProgressBar | null = null;

  @property
  autoEnterHome = true;

  protected start(): void {
    this.initialize();
  }

  initialize(): void {
    StorageManager.init();
    if (!GameManager.instance) {
      const managerNode = new Node('GameManager');
      (director.getScene() ?? this.node).addChild(managerNode);
      managerNode.addComponent(GameManager);
    }

    if (this.statusLabel) this.statusLabel.string = '加载猫舍中...';
    if (this.loadingProgress) this.loadingProgress.progress = 1;
    if (this.autoEnterHome) this.scheduleOnce(() => SceneRouter.goHome(), 0.2);
  }

  startGame(): void {
    SceneRouter.goHome();
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
