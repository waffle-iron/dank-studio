import Sound from '../audio/Sound'
import { SoundType } from '../audio/SoundType'
import SoundFactory from '../factory/SoundFactory'

export enum KeyboardStyles {
  ACTIVE = 'keyActive'
}

/**
 * Keyboard class.
 *
 * @author Daniel Peters
 * @version 1.0
 */
export default class Keyboard {
  context: AudioContext
  masterGain: GainNode
  compressor: DynamicsCompressorNode
  keySoundMap: Map<string, Sound>
  registeredInputs: Map<string, boolean>
  soundFactory: SoundFactory

  /**
   * Constructor.
   */
  constructor () {
    try {
      this.context = new AudioContext()
      this.masterGain = this.context.createGain()
      this.compressor = this.context.createDynamicsCompressor()
      this.soundFactory = new SoundFactory(this.context, this.compressor)
      this.keySoundMap = new Map<string, Sound>()
      this.registeredInputs = new Map<string, boolean>()
      this.masterGain.connect(this.context.destination)
      this.initCompressor()
      this.registerKeyHandler()
    } catch (error) {
      console.log('This browser does not support Web Audio API.', error)
    }
  }

  /**
   * Register a keyboard key with a sound
   *
   * @param key
   * @param frequency
   * @param type
   * @param oscillatorType
   */
  registerKey (key: string, frequency: number, type: SoundType = SoundType.OSCILLATOR, oscillatorType: OscillatorType = 'square'): void {
    this.keySoundMap.set(key, this.soundFactory.create(frequency, type, oscillatorType))
  }

  setDownEvent (key: string): void {
    if (!this.registeredInputs.get(key) && this.keySoundMap.get(key) !== undefined) {
      document.getElementById(key).classList.add(KeyboardStyles.ACTIVE)
      this.keySoundMap.get(key).init()
      this.keySoundMap.get(key).play()
      this.registeredInputs.set(key, true)
    }
  }

  setUpEvent (key: string): void {
    if (this.registeredInputs.get(key) && this.keySoundMap.get(key) !== undefined) {
      document.getElementById(key).classList.remove(KeyboardStyles.ACTIVE)
      this.keySoundMap.get(key).stop()
      this.registeredInputs.set(key, false)
    }
  }

  /**
   * Initialize the compressor to fix audio clipping.
   */
  private initCompressor (): void {
    this.compressor.threshold.value = -50
    this.compressor.knee.value = 40
    this.compressor.ratio.value = 12
    this.compressor.attack.value = 0
    this.compressor.release.value = 0.25
    this.compressor.connect(this.masterGain)
  }

  private registerKeyHandler (): void {
    window.addEventListener('keydown', event => this.setDownEvent(event.key))
    window.addEventListener('keyup', event => this.setUpEvent(event.key))
  }
}
