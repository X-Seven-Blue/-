import { _decorator, Component, Node, Label } from 'cc';
import { StorageManager } from '../core/StorageManager';
import { GROWTH_COMPLIANCE_LINES } from '../data/MockData';
import { Toast } from '../ui/Toast';
const { ccclass, property } = _decorator;

@ccclass('GrowthSceneController')
export class GrowthSceneController extends Component {
  @property(Label)
  limitLabel: Label | null = null;

  @property(Label)
  degreeLabel: Label | null = null;

  @property(Label)
  complianceLabel: Label | null = null;

  @property(Toast)
  toast: Toast | null = null;

  protected start(): void {
    this.refresh();
  }

  showGrowthInfo(): void {
    this.toast?.show('正式版将跳转微信官方页面。当前 Demo 不接入真实资金服务。', 2.2);
  }

  refresh(): void {
    const state = StorageManager.getState();
    if (this.limitLabel) this.limitLabel.string = `¥${state.user.growthLimit.toLocaleString()}`;
    if (this.degreeLabel) this.degreeLabel.string = state.user.degree;
    if (this.complianceLabel) this.complianceLabel.string = GROWTH_COMPLIANCE_LINES.map((line) => `· ${line}`).join('\n');
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
