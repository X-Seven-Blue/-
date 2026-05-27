import { _decorator, Component, Node, Button, Label, tween, Vec3 } from 'cc';
import { AudioManager } from '../core/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SoftButton')
export class SoftButton extends Component {
  @property(Label)
  label: Label | null = null;

  @property
  text = '';

  @property
  playClickSound = true;

  private button: Button | null = null;
  private clickHandlers: Array<() => void> = [];

  protected onLoad(): void {
    this.button = this.getComponent(Button) ?? this.node.addComponent(Button);
    this.button.transition = Button.Transition.SCALE;
    this.button.zoomScale = 0.96;
    this.node.on(Button.EventType.CLICK, this.handleClick, this);
    this.refresh();
  }

  onClick(handler: () => void): void {
    this.clickHandlers.push(handler);
  }

  clearClickHandlers(): void {
    this.clickHandlers.length = 0;
  }

  setText(text: string): void {
    this.text = text;
    this.refresh();
  }

  setInteractable(interactable: boolean): void {
    if (this.button) this.button.interactable = interactable;
  }

  private refresh(): void {
    if (this.label && this.text) this.label.string = this.text;
  }

  private handleClick(): void {
    if (this.playClickSound) AudioManager.instance?.playClick();
    tween(this.node).stop();
    tween(this.node)
      .to(0.06, { scale: new Vec3(0.96, 0.96, 1) })
      .to(0.12, { scale: Vec3.ONE })
      .start();
    this.clickHandlers.forEach((handler) => handler());
  }

  protected onDestroy(): void {
    this.node.off(Button.EventType.CLICK, this.handleClick, this);
    this.clearClickHandlers();
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
