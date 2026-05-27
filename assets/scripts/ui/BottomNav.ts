import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { SceneRouter } from '../core/SceneRouter';
import { SceneName } from '../data/GameState';
import { SoftButton } from './SoftButton';
const { ccclass, property } = _decorator;

@ccclass('BottomNav')
export class BottomNav extends Component {
  @property(SoftButton)
  homeButton: SoftButton | null = null;

  @property(SoftButton)
  studyButton: SoftButton | null = null;

  @property(SoftButton)
  tradeButton: SoftButton | null = null;

  @property(SoftButton)
  growthButton: SoftButton | null = null;

  @property(SoftButton)
  profileButton: SoftButton | null = null;

  @property
  activeScene: SceneName = 'Home';

  protected start(): void {
    this.bind(this.homeButton, 'Home');
    this.bind(this.studyButton, 'Study');
    this.bind(this.tradeButton, 'Trade');
    this.bind(this.growthButton, 'Growth');
    this.bind(this.profileButton, 'Profile');
    this.refreshActive();
  }

  setActive(sceneName: SceneName): void {
    this.activeScene = sceneName;
    this.refreshActive();
  }

  private bind(button: SoftButton | null, sceneName: SceneName): void {
    button?.onClick(() => {
      if (this.activeScene === sceneName) return;
      SceneRouter.load(sceneName);
    });
  }

  private refreshActive(): void {
    const pairs: Array<[SoftButton | null, SceneName]> = [
      [this.homeButton, 'Home'],
      [this.studyButton, 'Study'],
      [this.tradeButton, 'Trade'],
      [this.growthButton, 'Growth'],
      [this.profileButton, 'Profile'],
    ];

    pairs.forEach(([button, sceneName]) => {
      if (!button) return;
      const active = sceneName === this.activeScene;
      button.setInteractable(!active);
      tween(button.node).stop();
      tween(button.node).to(0.14, { scale: active ? new Vec3(1.06, 1.06, 1) : Vec3.ONE }).start();
    });
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
