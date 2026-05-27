import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ProgressBar')
export class ProgressBar extends Component {
  @property(Node)
  bar: Node | null = null;

  @property({ range: [0, 1, 0.01] })
  progress = 0;

  private fullWidth = 100;

  protected onLoad(): void {
    this.fullWidth = this.node.getComponent(UITransform)?.width ?? 100;
    this.setProgress(this.progress);
  }

  setProgress(value: number): void {
    this.progress = Math.max(0, Math.min(1, value));
    if (!this.bar) return;
    const transform = this.bar.getComponent(UITransform);
    if (transform) transform.setContentSize(this.fullWidth * this.progress, transform.height);
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
