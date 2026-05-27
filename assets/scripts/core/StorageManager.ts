import { _decorator, Component, Node, sys } from 'cc';
import { DEFAULT_STATE } from '../data/MockData';
import { ActionResult, GameState, RewardResult } from '../data/GameState';

const STORAGE_KEY = 'plant_cat_game_state_v1';
const PLANT_COST = 20;
const REQUIRED_STUDY_FOR_HARVEST = 3;

function cloneDefaultState(): GameState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE)) as GameState;
}

export class StorageManager {
  private static state: GameState | null = null;

  static init(): GameState {
    if (this.state) return this.state;

    const raw = sys.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.state = cloneDefaultState();
      this.save();
      return this.state;
    }

    try {
      this.state = { ...cloneDefaultState(), ...(JSON.parse(raw) as GameState) };
    } catch (error) {
      console.warn('[StorageManager] Save data is broken. Falling back to default state.', error);
      this.state = cloneDefaultState();
      this.save();
    }
    return this.state;
  }

  static getState(): GameState {
    return this.init();
  }

  static save(): void {
    if (!this.state) return;
    sys.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  static addCans(amount: number): number {
    const state = this.getState();
    state.user.cans = Math.max(0, state.user.cans + amount);
    this.save();
    return state.user.cans;
  }

  static reduceCans(amount: number): boolean {
    const state = this.getState();
    if (state.user.cans < amount) return false;
    state.user.cans -= amount;
    this.save();
    return true;
  }

  static addIntimacy(amount: number): number {
    const state = this.getState();
    state.user.intimacy = Math.min(100, Math.max(0, state.user.intimacy + amount));
    this.save();
    return state.user.intimacy;
  }

  static plantSeed(): ActionResult {
    const state = this.getState();
    if (state.user.seedPlanted) {
      return { ok: true, message: '小猫种子已经种下啦，继续学习让它长大吧' };
    }
    if (state.user.cans < PLANT_COST) {
      return { ok: false, message: `还需要 ${PLANT_COST} 个猫罐头才能种下小猫` };
    }
    state.user.cans -= PLANT_COST;
    state.user.seedPlanted = true;
    this.save();
    return { ok: true, message: '小猫种子已经种下啦' };
  }

  static harvestCat(): ActionResult {
    const state = this.getState();
    if (!state.user.seedPlanted) return { ok: false, message: '还没有种下小猫种子哦' };
    if (state.user.studyCompletedCount < REQUIRED_STUDY_FOR_HARVEST) {
      return { ok: false, message: `再完成 ${REQUIRED_STUDY_FOR_HARVEST - state.user.studyCompletedCount} 节小课，小猫就会长大啦` };
    }

    const nextCat = state.cats.find((cat) => !cat.unlocked);
    if (!nextCat) return { ok: false, message: '当前图鉴已经全部解锁啦' };

    nextCat.unlocked = true;
    state.user.catCount = state.cats.filter((cat) => cat.unlocked).length;
    state.user.seedPlanted = false;
    this.unlockAchievement('degree_miao');
    this.save();
    return { ok: true, message: `你收获了新小猫：${nextCat.name}` };
  }

  static completeCourse(courseId: string): RewardResult {
    const state = this.getState();
    const course = state.courses.find((item) => item.id === courseId);
    if (!course) return { ok: false, reward: 0, message: '没有找到这节课程' };
    if (course.progress >= 100) return { ok: false, reward: 0, message: '这节课已经完成啦' };

    course.progress = 100;
    state.user.studyCompletedCount += 1;
    state.user.cans += course.reward;
    this.unlockAchievement('first_course');
    this.save();
    return { ok: true, reward: course.reward, message: `学完啦，获得 ${course.reward} 个猫罐头` };
  }

  static runMockTrade(etfId: string): RewardResult {
    const state = this.getState();
    const item = state.tradeItems.find((tradeItem) => tradeItem.id === etfId);
    if (!item) return { ok: false, reward: 0, message: '先选一块实验田吧' };

    this.unlockAchievement('first_trade');
    const win = Math.random() < 0.6;
    if (!win) {
      this.save();
      return { ok: true, reward: 0, message: '阿橘蹭蹭你：没关系，模拟学习就是用来练手的～' };
    }

    const reward = 1 + Math.floor(Math.random() * 5);
    state.user.cans += reward;
    this.save();
    return { ok: true, reward, message: `阿橘撒花：模拟盘赚到 ${reward} 个罐头啦～` };
  }

  static unlockAchievement(id: string): boolean {
    const state = this.getState();
    const achievement = state.achievements.find((item) => item.id === id);
    if (!achievement || achievement.unlocked) return false;
    achievement.unlocked = true;
    this.save();
    return true;
  }

  static reset(): void {
    this.state = cloneDefaultState();
    this.save();
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
