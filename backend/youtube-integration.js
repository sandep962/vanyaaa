const axios = require('axios');
const { getAllVideoStreams } = require('./video-links');

class YouTubeLiveStreamFetcher {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Fetch live streams from YouTube channels
  async fetchLiveStreams(channelIds) {
    try {
      const liveStreams = [];
      
      for (const channelId of channelIds) {
        try {
          // Get channel's live broadcasts
          const response = await axios.get(`${this.baseUrl}/search`, {
            params: {
              part: 'snippet',
              channelId: channelId,
              type: 'video',
              eventType: 'live',
              maxResults: 5,
              key: this.apiKey
            }
          });

          if (response.data.items) {
            for (const item of response.data.items) {
              const videoId = item.id.videoId;
              
              // Get video details
              const videoDetails = await this.getVideoDetails(videoId);
              
              if (videoDetails) {
                liveStreams.push({
                  id: videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
                  streamUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0`,
                  channelTitle: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt,
                  isLive: true,
                  viewCount: videoDetails.viewCount,
                  duration: videoDetails.duration
                });
              }
            }
          }
        } catch (channelError) {
          console.error(`Error fetching streams for channel ${channelId}:`, channelError.message);
        }
      }

      return liveStreams;
    } catch (error) {
      console.error('YouTube API error:', error);
      return this.getFallbackStreams();
    }
  }

  // Get detailed video information
  async getVideoDetails(videoId) {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'statistics,contentDetails',
          id: videoId,
          key: this.apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        return {
          viewCount: video.statistics?.viewCount || '0',
          duration: video.contentDetails?.duration || 'PT0S'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  }

  // Get fallback streams when API fails
  getFallbackStreams() {
    return [
      {
        id: 'wildlife1',
        title: 'African Wildlife Live Stream',
        description: 'Live wildlife monitoring from African savanna',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
        channelTitle: 'Wildlife Monitoring',
        publishedAt: new Date().toISOString(),
        isLive: true,
        viewCount: '1000',
        duration: 'PT24H'
      },
      {
        id: 'wildlife2',
        title: 'Forest Wildlife Cam',
        description: 'Live forest wildlife monitoring camera',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
        channelTitle: 'Forest Watch',
        publishedAt: new Date().toISOString(),
        isLive: true,
        viewCount: '2000',
        duration: 'PT24H'
      },
      {
        id: 'wildlife3',
        title: 'Ocean Wildlife Stream',
        description: 'Live ocean wildlife monitoring',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
        channelTitle: 'Ocean Watch',
        publishedAt: new Date().toISOString(),
        isLive: true,
        viewCount: '1500',
        duration: 'PT24H'
      },
      {
        id: 'wildlife4',
        title: 'Mountain Wildlife Cam',
        description: 'Live mountain wildlife monitoring',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0',
        channelTitle: 'Mountain Watch',
        publishedAt: new Date().toISOString(),
        isLive: true,
        viewCount: '1200',
        duration: 'PT24H'
      }
    ];
  }

  // Search for wildlife-related live streams
  async searchWildlifeStreams() {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: 'wildlife live stream',
          type: 'video',
          eventType: 'live',
          maxResults: 10,
          key: this.apiKey
        }
      });

      const streams = [];
      if (response.data.items) {
        for (const item of response.data.items) {
          const videoId = item.id.videoId;
          const videoDetails = await this.getVideoDetails(videoId);
          
          if (videoDetails) {
            streams.push({
              id: videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
              streamUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              isLive: true,
              viewCount: videoDetails.viewCount,
              duration: videoDetails.duration
            });
          }
        }
      }

      return streams;
    } catch (error) {
      console.error('Error searching wildlife streams:', error);
      return this.getFallbackStreams();
    }
  }

  // Get custom video links from configuration
  getCustomVideoStreams() {
    return getAllVideoStreams();
  }
}

module.exports = YouTubeLiveStreamFetcher;
