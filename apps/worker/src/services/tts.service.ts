/**
 * TTS (Text-to-Speech) Service using Edge-TTS
 * Generates Korean voice narration for video scenes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface TTSOptions {
  voice?: string;
  rate?: string;  // Speech rate: -50% to +100%
  pitch?: string; // Voice pitch: -50Hz to +50Hz
  volume?: string; // Volume: -50% to +100%
}

export class TTSService {
  private defaultVoice = process.env.TTS_VOICE || 'ko-KR-SunHiNeural';
  private outputDir = process.env.OUTPUT_DIR || './storage/audio';

  constructor() {
    this.ensureOutputDir();
  }

  private async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error);
    }
  }

  /**
   * Generate TTS audio for Korean text
   */
  async generateAudio(
    text: string,
    outputFilename: string,
    options: TTSOptions = {}
  ): Promise<{ filepath: string; duration: number }> {
    const voice = options.voice || this.defaultVoice;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    // Build edge-tts command
    let command = `edge-tts --voice "${voice}" --text "${text.replace(/"/g, '\\"')}"`;
    
    if (options.rate) {
      command += ` --rate "${options.rate}"`;
    }
    if (options.pitch) {
      command += ` --pitch "${options.pitch}"`;
    }
    if (options.volume) {
      command += ` --volume "${options.volume}"`;
    }
    
    command += ` --write-media "${outputPath}"`;
    command += ` --write-subtitles "${outputPath}.vtt"`;

    try {
      // Execute edge-tts
      await execAsync(command);
      
      // Get audio duration using ffprobe
      const duration = await this.getAudioDuration(outputPath);
      
      return {
        filepath: outputPath,
        duration
      };
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw new Error(`Failed to generate TTS: ${error}`);
    }
  }

  /**
   * Generate TTS for multiple scenes
   */
  async generateSceneAudios(
    scenes: Array<{ id: string; narration: string }>,
    episodeId: string
  ): Promise<Map<string, { filepath: string; duration: number }>> {
    const results = new Map();
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const filename = `${episodeId}_scene_${i + 1}.mp3`;
      
      console.log(`Generating TTS for scene ${i + 1}/${scenes.length}`);
      
      const result = await this.generateAudio(scene.narration, filename);
      results.set(scene.id, result);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * Get audio duration in seconds
   */
  private async getAudioDuration(filepath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filepath}"`
      );
      return parseFloat(stdout);
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      // Default duration if ffprobe fails
      return 10.0;
    }
  }

  /**
   * List available Korean voices
   */
  async listKoreanVoices(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('edge-tts --list-voices');
      const lines = stdout.split('\n');
      const koreanVoices = lines
        .filter(line => line.includes('ko-KR'))
        .map(line => {
          const match = line.match(/Name: ([^\s]+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];
      
      return koreanVoices;
    } catch (error) {
      console.error('Failed to list voices:', error);
      return [this.defaultVoice];
    }
  }
}

/**
 * Korean voice options for different character types
 */
export const KOREAN_VOICES = {
  female: {
    sunHi: 'ko-KR-SunHiNeural',      // Young adult female
    jimin: 'ko-KR-JiMinNeural',      // Adult female
  },
  male: {
    inJoon: 'ko-KR-InJoonNeural',    // Adult male
    gookMin: 'ko-KR-GookMinNeural',  // Senior male
  }
};

/**
 * Speech style presets for different content types
 */
export const SPEECH_STYLES = {
  educational: {
    rate: '-10%',    // Slightly slower for clarity
    pitch: '+0Hz',    // Normal pitch
    volume: '+0%'     // Normal volume
  },
  dramatic: {
    rate: '-20%',     // Slower for emphasis
    pitch: '-5Hz',    // Slightly deeper
    volume: '+10%'    // Slightly louder
  },
  conversational: {
    rate: '+5%',      // Natural speed
    pitch: '+2Hz',    // Slightly higher
    volume: '+0%'     // Normal volume
  }
};