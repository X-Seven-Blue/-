import { _decorator, Component, Node, tween, Vec3, UIOpacity } from 'cc';
import { AudioManager } from '../core/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('RewardFly')
export class RewardFly extends Component {
  @property(Node)
  rewardIcon: Node | null = null;

  play(fromWorld: Vec3, toWorld: Vec3, onComplete?: () => void): void {
    const icon = this.rewardIcon ?? this.node;
    icon.active = true;
    icon.worldPosition = fromWorld;
    icon.setScale(new Vec3(0.82, 0.82, 1));

    const opacity = icon.getComponent(UIOpacity) ?? icon.addComponent(UIOpacity);
    opacity.opacity = 255;

    const mid = new Vec3(
      (fromWorld.x + toWorld.x) / 2,
      Math.max(fromWorld.y, toWorld.y) + 120,
      fromWorld.z,
    );

    tween(icon).stop();
    tween(opacity).stop();
    tween(icon)
      .to(0.24, { worldPosition: mid, scale: new Vec3(1.05, 1.05, 1) }, { easing: 'quadOut' })
      .to(0.34, { worldPosition: toWorld, scale: new Vec3(0.58, 0.58, 1) }, { easing: 'quadIn' })
      .call(() => {
        icon.active = false;
        AudioManager.instance?.playReward();
        onComplete?.();
      })
      .start();

    tween(opacity).delay(0.32).to(0.24, { opacity: 0 }).start();
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
