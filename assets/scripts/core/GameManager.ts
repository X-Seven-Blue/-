import { _decorator, Component, Node, game } from 'cc';
import { StorageManager } from './StorageManager';
import { EventBus } from './EventBus';
import { PET_MESSAGES } from '../data/MockData';
import { GameState, RewardResult, ActionResult } from '../data/GameState';
const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  static instance: GameManager | null = null;

  protected onLoad(): void {
    if (GameManager.instance && GameManager.instance !== this) {
      this.node.destroy();
      return;
    }

    GameManager.instance = this;
    game.addPersistRootNode(this.node);
    StorageManager.init();
  }

  get state(): GameState {
    return StorageManager.getState();
  }

  petCat(): ActionResult {
    StorageManager.addIntimacy(1);
    StorageManager.unlockAchievement('first_touch');
    this.emitStateChanged();
    EventBus.emit('intimacy-changed', this.state.user.intimacy);
    return { ok: true, message: PET_MESSAGES[Math.floor(Math.random() * PET_MESSAGES.length)] };
  }

  feedCat(): ActionResult {
    if (!StorageManager.reduceCans(1)) {
      return { ok: false, message: '罐头不够啦，去学习赚一点吧' };
    }

    StorageManager.addIntimacy(2);
    StorageManager.unlockAchievement('first_feed');
    this.emitStateChanged();
    EventBus.emit('cans-changed', this.state.user.cans);
    EventBus.emit('intimacy-changed', this.state.user.intimacy);
    return { ok: true, message: '阿橘吃得很开心！' };
  }

  plantSeed(): ActionResult {
    const result = StorageManager.plantSeed();
    this.emitStateChanged();
    return result;
  }

  harvestCat(): ActionResult {
    const result = StorageManager.harvestCat();
    this.emitStateChanged();
    return result;
  }

  completeCourse(courseId: string): RewardResult {
    const result = StorageManager.completeCourse(courseId);
    this.emitStateChanged();
    if (result.reward > 0) EventBus.emit('cans-changed', this.state.user.cans);
    return result;
  }

  runMockTrade(etfId: string): RewardResult {
    const result = StorageManager.runMockTrade(etfId);
    this.emitStateChanged();
    if (result.reward > 0) EventBus.emit('cans-changed', this.state.user.cans);
    return result;
  }

  resetSave(): void {
    StorageManager.reset();
    this.emitStateChanged();
  }

  private emitStateChanged(): void {
    EventBus.emit('state-changed', this.state);
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
