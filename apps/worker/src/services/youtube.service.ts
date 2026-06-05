/**
 * YouTube Upload Service
 * Handles video upload and metadata management via YouTube Data API v3
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

const youtube = google.youtube('v3');

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId?: string; // 27 = Education
  privacyStatus?: 'private' | 'unlisted' | 'public';
  publishAt?: Date;
  thumbnailPath?: string;
}

export class YouTubeService {
  private oauth2Client: OAuth2Client;
  private authenticated = false;

  constructor() {
    this.oauth2Client = new OAuth2Client();
    this.initialize();
  }

  private async initialize() {
    try {
      await this.authenticate();
    } catch (error) {
      console.error('YouTube authentication failed:', error);
    }
  }

  /**
   * Authenticate with YouTube using stored tokens
   */
  private async authenticate() {
    const clientSecretPath = process.env.YOUTUBE_CLIENT_SECRET_PATH || './secrets/client_secret.json';
    const tokenPath = process.env.YOUTUBE_TOKEN_PATH || './secrets/token.json';

    try {
      // Load client secret
      const credentials = JSON.parse(fs.readFileSync(clientSecretPath, 'utf-8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      
      this.oauth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

      // Load saved token
      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
        this.oauth2Client.setCredentials(token);
        this.authenticated = true;
        console.log('YouTube authentication successful');
      } else {
        console.log('No token found. Please run authentication flow first.');
        // In production, implement proper OAuth flow
        // For now, provide instructions
        await this.getAuthUrl();
      }
    } catch (error) {
      console.error('Failed to load YouTube credentials:', error);
      throw error;
    }
  }

  /**
   * Get OAuth URL for first-time authentication
   */
  private async getAuthUrl(): Promise<string> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
      ],
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    return authUrl;
  }

  /**
   * Upload video to YouTube
   */
  async uploadVideo(
    videoPath: string,
    metadata: VideoMetadata
  ): Promise<{ videoId: string; videoUrl: string }> {
    if (!this.authenticated) {
      throw new Error('YouTube service not authenticated');
    }

    try {
      console.log(`Uploading video: ${metadata.title}`);

      // Prepare video resource
      const videoResource = {
        snippet: {
          title: metadata.title,
          description: metadata.description + '\n\n🤖 Generated with Saju Engine',
          tags: metadata.tags,
          categoryId: metadata.categoryId || '27', // Education
        },
        status: {
          privacyStatus: metadata.privacyStatus || 'private',
          publishAt: metadata.publishAt?.toISOString(),
        },
      };

      // Create video stream
      const videoStream = fs.createReadStream(videoPath);

      // Upload video
      const response = await youtube.videos.insert({
        auth: this.oauth2Client,
        part: ['snippet', 'status'],
        requestBody: videoResource,
        media: {
          body: videoStream,
        },
      });

      const videoId = response.data.id!;
      console.log(`Video uploaded successfully: ${videoId}`);

      // Upload thumbnail if provided
      if (metadata.thumbnailPath && fs.existsSync(metadata.thumbnailPath)) {
        await this.uploadThumbnail(videoId, metadata.thumbnailPath);
      }

      return {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload custom thumbnail
   */
  private async uploadThumbnail(videoId: string, thumbnailPath: string): Promise<void> {
    try {
      const thumbnailStream = fs.createReadStream(thumbnailPath);

      await youtube.thumbnails.set({
        auth: this.oauth2Client,
        videoId,
        media: {
          body: thumbnailStream,
        },
      });

      console.log(`Thumbnail uploaded for video ${videoId}`);
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      // Non-critical error, continue
    }
  }

  /**
   * Update video metadata
   */
  async updateVideo(
    videoId: string,
    updates: Partial<VideoMetadata>
  ): Promise<void> {
    if (!this.authenticated) {
      throw new Error('YouTube service not authenticated');
    }

    try {
      const requestBody: any = {
        id: videoId,
      };

      if (updates.title || updates.description || updates.tags) {
        requestBody.snippet = {
          ...(updates.title && { title: updates.title }),
          ...(updates.description && { description: updates.description }),
          ...(updates.tags && { tags: updates.tags }),
        };
      }

      if (updates.privacyStatus) {
        requestBody.status = {
          privacyStatus: updates.privacyStatus,
        };
      }

      await youtube.videos.update({
        auth: this.oauth2Client,
        part: Object.keys(requestBody).filter(k => k !== 'id'),
        requestBody,
      });

      console.log(`Video ${videoId} updated successfully`);
    } catch (error) {
      console.error('Video update failed:', error);
      throw error;
    }
  }

  /**
   * Get upload quota usage
   */
  async getQuotaUsage(): Promise<{ used: number; limit: number }> {
    // YouTube API quota is 10,000 units per day
    // Video upload costs ~1600 units
    // This is a simplified calculation
    
    const DAILY_LIMIT = 10000;
    const UPLOAD_COST = 1600;
    
    // In production, track actual usage in database
    return {
      used: 0, // Would be tracked in database
      limit: DAILY_LIMIT,
    };
  }

  /**
   * Create a playlist
   */
  async createPlaylist(
    title: string,
    description: string,
    privacyStatus: 'private' | 'unlisted' | 'public' = 'public'
  ): Promise<string> {
    if (!this.authenticated) {
      throw new Error('YouTube service not authenticated');
    }

    try {
      const response = await youtube.playlists.insert({
        auth: this.oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
          },
          status: {
            privacyStatus,
          },
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error('Playlist creation failed:', error);
      throw error;
    }
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(playlistId: string, videoId: string): Promise<void> {
    if (!this.authenticated) {
      throw new Error('YouTube service not authenticated');
    }

    try {
      await youtube.playlistItems.insert({
        auth: this.oauth2Client,
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        },
      });

      console.log(`Video ${videoId} added to playlist ${playlistId}`);
    } catch (error) {
      console.error('Failed to add video to playlist:', error);
      throw error;
    }
  }

  /**
   * Schedule video publication
   */
  async schedulePublication(
    videoId: string,
    publishAt: Date
  ): Promise<void> {
    await this.updateVideo(videoId, {
      privacyStatus: 'private',
      publishAt,
    });
  }
}