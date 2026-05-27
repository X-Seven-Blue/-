import { _decorator, Component, Node, Label } from 'cc';
import { StorageManager } from '../core/StorageManager';
import { Toast } from '../ui/Toast';
const { ccclass, property } = _decorator;

@ccclass('ProfileSceneController')
export class ProfileSceneController extends Component {
  @property(Label)
  nicknameLabel: Label | null = null;

  @property(Label)
  canLabel: Label | null = null;

  @property(Label)
  intimacyLabel: Label | null = null;

  @property(Label)
  studyDaysLabel: Label | null = null;

  @property(Label)
  catCountLabel: Label | null = null;

  @property(Label)
  achievementCountLabel: Label | null = null;

  @property(Toast)
  toast: Toast | null = null;

  protected start(): void {
    this.refresh();
  }

  refresh(): void {
    const state = StorageManager.getState();
    const unlockedAchievements = state.achievements.filter((item) => item.unlocked).length;

    if (this.nicknameLabel) this.nicknameLabel.string = state.user.nickname;
    if (this.canLabel) this.canLabel.string = String(state.user.cans);
    if (this.intimacyLabel) this.intimacyLabel.string = String(state.user.intimacy);
    if (this.studyDaysLabel) this.studyDaysLabel.string = String(state.user.studyDays);
    if (this.catCountLabel) this.catCountLabel.string = String(state.user.catCount);
    if (this.achievementCountLabel) this.achievementCountLabel.string = `${unlockedAchievements}/${state.achievements.length}`;
  }

  showAchievement(id: string): void {
    const achievement = StorageManager.getState().achievements.find((item) => item.id === id);
    if (!achievement) {
      this.toast?.show('神秘成就，还没解锁喵');
      return;
    }
    this.toast?.show(achievement.unlocked ? `${achievement.name}：${achievement.desc}` : achievement.desc);
  }

  showFirstAchievement(): void {
    const first = StorageManager.getState().achievements[0];
    if (first) this.showAchievement(first.id);
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
