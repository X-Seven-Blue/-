import { _decorator, Component, Node, Label } from 'cc';
import { GameManager } from '../core/GameManager';
import { StorageManager } from '../core/StorageManager';
import { TRADE_DISCLAIMER } from '../data/MockData';
import { Toast } from '../ui/Toast';
const { ccclass, property } = _decorator;

@ccclass('TradeSceneController')
export class TradeSceneController extends Component {
  @property(Label)
  canLabel: Label | null = null;

  @property(Label)
  selectedLabel: Label | null = null;

  @property(Label)
  disclaimerLabel: Label | null = null;

  @property(Toast)
  toast: Toast | null = null;

  private selectedEtfId = '';

  protected start(): void {
    if (this.disclaimerLabel) this.disclaimerLabel.string = TRADE_DISCLAIMER;
    this.refresh();
  }

  selectEtf(id: string): void {
    this.selectedEtfId = id;
    const item = StorageManager.getState().tradeItems.find((tradeItem) => tradeItem.id === id);
    if (this.selectedLabel) this.selectedLabel.string = item ? item.name : '已选择实验田';
    this.toast?.show(item ? `已选择 ${item.name}` : '已选择一块实验田');
  }

  selectFirstEtf(): void {
    const first = StorageManager.getState().tradeItems[0];
    if (first) this.selectEtf(first.id);
  }

  catAutoTrade(): void {
    const result = GameManager.instance?.runMockTrade(this.selectedEtfId) ?? StorageManager.runMockTrade(this.selectedEtfId);
    this.toast?.show(result.message);
    this.refresh();
  }

  refresh(): void {
    if (this.canLabel) this.canLabel.string = String(StorageManager.getState().user.cans);
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
