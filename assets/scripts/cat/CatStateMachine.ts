import { _decorator, Component, Node } from 'cc';
import { CatMood } from '../data/GameState';

export class CatStateMachine {
  private state: CatMood = 'idle';
  private remaining = 0;
  private onBackToIdle: (() => void) | null = null;

  get current(): CatMood {
    return this.state;
  }

  set(state: CatMood, duration = 0, onBackToIdle?: () => void): void {
    this.state = state;
    this.remaining = duration;
    this.onBackToIdle = onBackToIdle ?? null;
  }

  update(deltaTime: number): void {
    if (this.state === 'idle' || this.remaining <= 0) return;
    this.remaining -= deltaTime;
    if (this.remaining > 0) return;

    this.state = 'idle';
    this.remaining = 0;
    const callback = this.onBackToIdle;
    this.onBackToIdle = null;
    callback?.();
  }

  reset(): void {
    this.state = 'idle';
    this.remaining = 0;
    this.onBackToIdle = null;
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
