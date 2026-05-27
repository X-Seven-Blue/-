import { _decorator, Component, Node, Label } from 'cc';
import { GameManager } from '../core/GameManager';
import { StorageManager } from '../core/StorageManager';
import { Toast } from '../ui/Toast';
import { RewardFly } from '../ui/RewardFly';
const { ccclass, property } = _decorator;

@ccclass('StudySceneController')
export class StudySceneController extends Component {
  @property(Label)
  canLabel: Label | null = null;

  @property(Label)
  learnedLabel: Label | null = null;

  @property(Toast)
  toast: Toast | null = null;

  @property(RewardFly)
  rewardFly: RewardFly | null = null;

  @property(Node)
  rewardTarget: Node | null = null;

  protected start(): void {
    this.refresh();
  }

  completeCourse(courseId: string): void {
    const result = GameManager.instance?.completeCourse(courseId) ?? StorageManager.completeCourse(courseId);
    this.toast?.show(result.message);
    if (result.ok && result.reward > 0 && this.rewardFly && this.rewardTarget) {
      this.rewardFly.play(this.node.worldPosition, this.rewardTarget.worldPosition, () => this.refresh());
    } else {
      this.refresh();
    }
  }

  completeFirstCourse(): void {
    const first = StorageManager.getState().courses.find((course) => course.progress < 100);
    if (first) this.completeCourse(first.id);
    else this.toast?.show('今天的小课都完成啦');
  }

  refresh(): void {
    const state = StorageManager.getState();
    const learned = state.courses.filter((course) => course.progress >= 100).length;
    if (this.canLabel) this.canLabel.string = String(state.user.cans);
    if (this.learnedLabel) this.learnedLabel.string = String(learned);
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
