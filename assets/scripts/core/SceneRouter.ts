import { _decorator, Component, Node, director } from 'cc';
import { EventBus } from './EventBus';
import { SceneName } from '../data/GameState';
const { ccclass } = _decorator;

@ccclass('SceneRouter')
export class SceneRouter extends Component {
  static currentScene: SceneName = 'Boot';
  private static loading = false;

  static load(sceneName: SceneName): void {
    if (this.loading || sceneName === this.currentScene) return;

    this.loading = true;
    EventBus.emit('scene-changing', sceneName);
    director.loadScene(sceneName, (error) => {
      this.loading = false;
      if (error) {
        console.error(`[SceneRouter] Failed to load scene: ${sceneName}`, error);
        return;
      }
      this.currentScene = sceneName;
      EventBus.emit('scene-changed', sceneName);
    });
  }

  static goHome(): void { this.load('Home'); }
  static goStudy(): void { this.load('Study'); }
  static goTrade(): void { this.load('Trade'); }
  static goGrowth(): void { this.load('Growth'); }
  static goProfile(): void { this.load('Profile'); }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
