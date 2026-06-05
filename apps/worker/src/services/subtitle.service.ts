/**
 * Subtitle Service using Whisper
 * Generates synchronized Korean subtitles from audio
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export class SubtitleService {
  private outputDir = process.env.OUTPUT_DIR || './storage/subtitles';
  private whisperModel = 'base'; // Options: tiny, base, small, medium, large

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
   * Generate subtitles from audio using Whisper
   */
  async generateSubtitles(
    audioPath: string,
    outputFilename: string,
    language: string = 'ko'
  ): Promise<{ srtPath: string; segments: SubtitleSegment[] }> {
    const outputPath = path.join(this.outputDir, outputFilename);
    const srtPath = `${outputPath}.srt`;
    const jsonPath = `${outputPath}.json`;

    try {
      // Run Whisper transcription
      const command = `whisper "${audioPath}" --model ${this.whisperModel} --language ${language} --output_format srt --output_dir "${this.outputDir}" --fp16 False`;
      
      console.log('Running Whisper transcription...');
      await execAsync(command);

      // Also generate JSON for programmatic access
      const jsonCommand = `whisper "${audioPath}" --model ${this.whisperModel} --language ${language} --output_format json --output_dir "${this.outputDir}" --fp16 False`;
      await execAsync(jsonCommand);

      // Parse JSON output to get segments
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const transcription = JSON.parse(jsonContent);
      
      const segments: SubtitleSegment[] = transcription.segments.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim()
      }));

      return {
        srtPath,
        segments
      };
    } catch (error) {
      console.error('Subtitle generation failed:', error);
      throw new Error(`Failed to generate subtitles: ${error}`);
    }
  }

  /**
   * Generate subtitles for multiple audio files
   */
  async generateSceneSubtitles(
    audioFiles: Array<{ id: string; audioPath: string }>,
    episodeId: string
  ): Promise<Map<string, { srtPath: string; segments: SubtitleSegment[] }>> {
    const results = new Map();

    for (let i = 0; i < audioFiles.length; i++) {
      const audio = audioFiles[i];
      const filename = `${episodeId}_scene_${i + 1}`;
      
      console.log(`Generating subtitles for scene ${i + 1}/${audioFiles.length}`);
      
      const result = await this.generateSubtitles(audio.audioPath, filename);
      results.set(audio.id, result);
    }

    return results;
  }

  /**
   * Convert VTT to SRT format
   */
  async vttToSrt(vttPath: string): Promise<string> {
    const vttContent = await fs.readFile(vttPath, 'utf-8');
    
    // Remove WEBVTT header
    let srtContent = vttContent.replace(/^WEBVTT\n\n/, '');
    
    // Replace timestamps format (. to ,)
    srtContent = srtContent.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2');
    
    // Add subtitle numbering
    const lines = srtContent.split('\n\n');
    const numberedSrt = lines
      .map((block, index) => {
        if (block.trim()) {
          return `${index + 1}\n${block}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');

    const srtPath = vttPath.replace('.vtt', '.srt');
    await fs.writeFile(srtPath, numberedSrt);
    
    return srtPath;
  }

  /**
   * Merge multiple SRT files into one
   */
  async mergeSrtFiles(
    srtFiles: Array<{ path: string; startTime: number }>,
    outputPath: string
  ): Promise<string> {
    let mergedContent = '';
    let subtitleIndex = 1;

    for (const file of srtFiles) {
      const content = await fs.readFile(file.path, 'utf-8');
      const blocks = content.split('\n\n').filter(Boolean);
      
      for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length >= 3) {
          // Update subtitle number
          lines[0] = String(subtitleIndex++);
          
          // Adjust timestamps if needed
          if (file.startTime > 0) {
            const timeMatch = lines[1].match(
              /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/
            );
            
            if (timeMatch) {
              const startMs = this.timeToMs(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
              const endMs = this.timeToMs(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
              
              lines[1] = `${this.msToTime(startMs + file.startTime * 1000)} --> ${this.msToTime(endMs + file.startTime * 1000)}`;
            }
          }
          
          mergedContent += lines.join('\n') + '\n\n';
        }
      }
    }

    await fs.writeFile(outputPath, mergedContent);
    return outputPath;
  }

  private timeToMs(hours: string, minutes: string, seconds: string, ms: string): number {
    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseInt(seconds) * 1000 +
      parseInt(ms)
    );
  }

  private msToTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  }

  /**
   * Style subtitles for senior-friendly viewing
   */
  generateStyledSubtitles(segments: SubtitleSegment[]): string {
    // ASS format for styled subtitles
    const assHeader = `[Script Info]
Title: Saju Engineering Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV
Style: Korean,Noto Sans CJK KR,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,1,3,0,2,30,30,50

[Events]
Format: Layer, Start, End, Style, Text
`;

    const events = segments.map(seg => {
      const start = this.secondsToAssTime(seg.start);
      const end = this.secondsToAssTime(seg.end);
      return `Dialogue: 0,${start},${end},Korean,${seg.text}`;
    }).join('\n');

    return assHeader + events;
  }

  private secondsToAssTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }
}