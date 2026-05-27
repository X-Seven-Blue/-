import { _decorator, Component, Node } from 'cc';

export type GameEvent =
  | 'state-changed'
  | 'cans-changed'
  | 'intimacy-changed'
  | 'achievement-unlocked'
  | 'scene-changing'
  | 'scene-changed';

type EventHandler<T = unknown> = (payload?: T) => void;

export class EventBus {
  private static listeners: Map<string, Set<EventHandler>> = new Map();

  static on<T = unknown>(eventName: GameEvent | string, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    this.listeners.get(eventName)!.add(handler as EventHandler);
  }

  static off<T = unknown>(eventName: GameEvent | string, handler: EventHandler<T>): void {
    this.listeners.get(eventName)?.delete(handler as EventHandler);
  }

  static emit<T = unknown>(eventName: GameEvent | string, payload?: T): void {
    this.listeners.get(eventName)?.forEach((handler) => handler(payload));
  }

  static clear(eventName?: GameEvent | string): void {
    if (eventName) this.listeners.delete(eventName);
    else this.listeners.clear();
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
