import { _decorator, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { CatStateMachine } from './CatStateMachine';
const { ccclass, property } = _decorator;

@ccclass('CatController')
export class CatController extends Component {
  @property(Sprite)
  sprite: Sprite | null = null;

  @property(SpriteFrame)
  idleFrame: SpriteFrame | null = null;

  @property(SpriteFrame)
  happyFrame: SpriteFrame | null = null;

  @property(SpriteFrame)
  eatFrame: SpriteFrame | null = null;

  @property(SpriteFrame)
  sleepFrame: SpriteFrame | null = null;

  private machine = new CatStateMachine();

  protected start(): void {
    this.resetIdle();
  }

  protected update(deltaTime: number): void {
    this.machine.update(deltaTime);
  }

  resetIdle(): void {
    this.machine.set('idle');
    this.setFrame(this.idleFrame);
    this.startIdleBreathe();
  }

  playHappy(): void {
    this.machine.set('happy', 0.8, () => this.resetIdle());
    this.setFrame(this.happyFrame ?? this.idleFrame);
    this.playPulse();
  }

  playEat(): void {
    this.machine.set('eat', 1, () => this.resetIdle());
    this.setFrame(this.eatFrame ?? this.idleFrame);
    this.playPulse();
  }

  playSleep(): void {
    this.machine.set('sleep');
    this.setFrame(this.sleepFrame ?? this.idleFrame);
    this.startIdleBreathe(1.6, 1.01);
  }

  private startIdleBreathe(duration = 1.1, scale = 1.03): void {
    tween(this.node).stop();
    this.node.setScale(Vec3.ONE);
    tween(this.node)
      .to(duration, { scale: new Vec3(scale, scale, 1) }, { easing: 'sineInOut' })
      .to(duration, { scale: Vec3.ONE }, { easing: 'sineInOut' })
      .union()
      .repeatForever()
      .start();
  }

  private playPulse(): void {
    tween(this.node).stop();
    this.node.setScale(Vec3.ONE);
    tween(this.node)
      .to(0.12, { scale: new Vec3(1.08, 1.08, 1) }, { easing: 'backOut' })
      .to(0.16, { scale: Vec3.ONE }, { easing: 'sineOut' })
      .start();
  }

  private setFrame(frame: SpriteFrame | null): void {
    if (this.sprite && frame) this.sprite.spriteFrame = frame;
  }

  protected onDestroy(): void {
    this.machine.reset();
    tween(this.node).stop();
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
