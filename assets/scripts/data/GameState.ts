import { _decorator, Component, Node } from 'cc';

export type CatMood = 'idle' | 'happy' | 'eat' | 'sleep';
export type SceneName = 'Boot' | 'Home' | 'Study' | 'Trade' | 'Growth' | 'Profile';

export interface UserState {
  nickname: string;
  cans: number;
  intimacy: number;
  degree: string;
  growthLimit: number;
  catCount: number;
  studyDays: number;
  studyCompletedCount: number;
  seedPlanted: boolean;
}

export interface CatData {
  id: string;
  name: string;
  breed: string;
  mbti: string;
  personality: string;
  unlocked: boolean;
}

export interface CourseData {
  id: string;
  title: string;
  category: string;
  duration: number;
  reward: number;
  progress: number;
  desc: string;
}

export interface TradeItemData {
  id: string;
  name: string;
  price: number;
  changePercent: number;
  riskLevel: string;
  desc: string;
}

export interface AchievementData {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
}

export interface GameState {
  user: UserState;
  cats: CatData[];
  courses: CourseData[];
  tradeItems: TradeItemData[];
  achievements: AchievementData[];
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

export interface RewardResult extends ActionResult {
  reward: number;
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
