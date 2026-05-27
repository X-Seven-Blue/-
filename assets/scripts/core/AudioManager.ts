import { _decorator, Component, Node, AudioClip, AudioSource, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
  static instance: AudioManager | null = null;

  @property(AudioSource)
  audioSource: AudioSource | null = null;

  @property(AudioClip)
  clickClip: AudioClip | null = null;

  @property(AudioClip)
  rewardClip: AudioClip | null = null;

  @property(AudioClip)
  meowClip: AudioClip | null = null;

  @property
  muted = false;

  protected onLoad(): void {
    if (AudioManager.instance && AudioManager.instance !== this) {
      this.node.destroy();
      return;
    }
    AudioManager.instance = this;
    game.addPersistRootNode(this.node);
    if (!this.audioSource) this.audioSource = this.getComponent(AudioSource) ?? this.node.addComponent(AudioSource);
  }

  playClick(): void { this.play(this.clickClip); }
  playReward(): void { this.play(this.rewardClip); }
  playMeow(): void { this.play(this.meowClip); }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audioSource) this.audioSource.volume = muted ? 0 : 1;
  }

  private play(clip: AudioClip | null): void {
    if (this.muted || !this.audioSource || !clip) return;
    this.audioSource.playOneShot(clip, 1);
  }
}

export const __cocosTypeAnchor = { _decorator, Component, Node };
