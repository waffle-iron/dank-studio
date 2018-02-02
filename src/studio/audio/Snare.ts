/**
 * Snare sound class.
 *
 * @author Daniel Peters
 * @version 1.0
 */
export default class Snare {
  private context: AudioContext
  private noise: AudioBufferSourceNode
  private frequency: number
  private noiseFrequency: number
  private noiseFilter: BiquadFilterType
  private oscillatorType: OscillatorType
  private noiseGain: GainNode
  private oscillator: OscillatorNode
  private oscillatorGain: GainNode
  /**
   *
   * @param {AudioContext} context
   * @param {number} frequency
   * @param {number} noiseFrequency
   * @param {string} noiseFilter
   * @param {string} oscillatorType
   */
  constructor (context: AudioContext, frequency: number, noiseFrequency: number, noiseFilter: BiquadFilterType, oscillatorType: OscillatorType) {
    this.context = context
    this.noise = context.createBufferSource()
    this.frequency = frequency
    this.noiseFrequency = noiseFrequency
    this.noiseFilter = noiseFilter
    this.oscillatorType = oscillatorType
    this.noiseGain = context.createGain()
    this.oscillator = context.createOscillator()
    this.oscillatorGain = context.createGain()
  }

  /**
   *
   * @returns {AudioBuffer}
   */
  private createNoiseBuffer (): AudioBuffer {
    const bufferSize = this.context.sampleRate
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate)
    const output = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    return buffer
  }

  /**
   *
   */
  private init (): void {
    const noiseFilter = this.context.createBiquadFilter()
    this.noise.buffer = this.createNoiseBuffer()
    noiseFilter.type = this.noiseFilter
    noiseFilter.frequency.value = this.noiseFrequency
    this.noise.connect(noiseFilter)
    noiseFilter.connect(this.noiseGain)
    this.noiseGain.connect(this.context.destination)
    this.oscillator.type = this.oscillatorType
    this.oscillator.connect(this.oscillatorGain)
    this.oscillatorGain.connect(this.context.destination)
  }

  /**
   *
   * @param {number} time
   */
  public play (time: number): void {
    this.init()

    this.noiseGain.gain.setValueAtTime(1, time)
    this.noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2)

    this.noise.start(time)

    this.oscillator.frequency.setValueAtTime(this.frequency, time)
    this.oscillatorGain.gain.setValueAtTime(0.7, time)
    this.oscillatorGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)

    this.oscillator.start(time)

    this.oscillator.stop(time + 0.2)
    this.noise.stop(time + 0.2)
  }
}