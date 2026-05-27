import { _decorator, Component, Node, Label, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Toast')
export class Toast extends Component {
  @property(Label)
  label: Label | null = null;

  @property(Node)
  panel: Node | null = null;

  private opacity: UIOpacity | null = null;

  protected onLoad(): void {
    const target = this.panel ?? this.node;
    this.opacity = target.getComponent(UIOpacity) ?? target.addComponent(UIOpacity);
    target.active = false;
  }

  show(message: string, duration = 1.5): void {
    const target = this.panel ?? this.node;
    if (this.label) this.label.string = message;
    target.active = true;
    target.setScale(new Vec3(0.96, 0.96, 1));
    if (this.opacity) this.opacity.opacity = 0;

    tween(target).stop();
    if (this.opacity) tween(this.opacity).stop();

    tween(target)
      .to(0.18, { scale: Vec3.ONE }, { easing: 'backOut' })
      .start();

    if (this.opacity) {
      tween(this.opacity)
        .to(0.15, { opacity: 255 })
        .delay(duration)
        .to(0.2, { opacity: 0 })
        .call(() => { target.active = false; })
        .start();
    }
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
