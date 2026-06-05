/**
 * Main worker entry point
 * Processes BullMQ jobs for the 8-stage pipeline
 */

import 'dotenv/config';
import { pipelineWorker, createEpisodePipeline } from './queues/pipeline';
import { TTSService } from './services/tts.service';
import { SubtitleService } from './services/subtitle.service';
import { YouTubeService } from './services/youtube.service';

// Initialize services
const ttsService = new TTSService();
const subtitleService = new SubtitleService();
const youtubeService = new YouTubeService();

// Start worker
console.log('🚀 Saju Engine Worker started');
console.log('📡 Listening for pipeline jobs...');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await pipelineWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await pipelineWorker.close();
  process.exit(0);
});

// Export services for use in queue processors
export { ttsService, subtitleService, youtubeService };

// Log worker status
setInterval(() => {
  console.log(`⚙️  Worker healthy - ${new Date().toISOString()}`);
}, 60000); // Every minute