// Custom video links configuration
// Add your own YouTube video IDs here for wildlife monitoring

const CUSTOM_VIDEO_LINKS = {
  // Replace these with actual wildlife video IDs
  wildlife: [
    {
      id: 'wildlife1',
      videoId: 'XsOU8JnEpNM', // Replace with actual video ID
      title: 'African Wildlife Live Stream',
      description: 'Live wildlife monitoring from African savanna',
      channelTitle: 'Wildlife Monitoring'
    },
    {
      id: 'wildlife2', 
      videoId: 'XsOU8JnEpNM', // Replace with actual video ID
      title: 'Forest Wildlife Cam',
      description: 'Live forest wildlife monitoring camera',
      channelTitle: 'Forest Watch'
    },
    {
      id: 'wildlife3',
      videoId: 'XsOU8JnEpNM', // Replace with actual video ID
      title: 'Ocean Wildlife Stream',
      description: 'Live ocean wildlife monitoring',
      channelTitle: 'Ocean Watch'
    },
    {
      id: 'wildlife4',
      videoId: 'XsOU8JnEpNM', // Replace with actual video ID
      title: 'Mountain Wildlife Cam',
      description: 'Live mountain wildlife monitoring',
      channelTitle: 'Mountain Watch'
    }
  ],
  
  // You can add more categories
  nature: [
    {
      id: 'nature1',
      videoId: 'XsOU8JnEpNM', // Replace with actual video ID
      title: 'Nature Live Stream 1',
      description: 'Live nature monitoring',
      channelTitle: 'Nature Watch'
    }
  ]
};

// Function to get all video streams
function getAllVideoStreams() {
  const allStreams = [];
  
  // Add wildlife streams
  CUSTOM_VIDEO_LINKS.wildlife.forEach(stream => {
    allStreams.push({
      id: stream.id,
      title: stream.title,
      description: stream.description,
      thumbnail: `https://img.youtube.com/vi/${stream.videoId}/mqdefault.jpg`,
      streamUrl: `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`,
      channelTitle: stream.channelTitle,
      publishedAt: new Date().toISOString(),
      isLive: true,
      viewCount: '500',
      duration: 'PT24H'
    });
  });
  
  // Add nature streams
  CUSTOM_VIDEO_LINKS.nature.forEach(stream => {
    allStreams.push({
      id: stream.id,
      title: stream.title,
      description: stream.description,
      thumbnail: `https://img.youtube.com/vi/${stream.videoId}/mqdefault.jpg`,
      streamUrl: `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`,
      channelTitle: stream.channelTitle,
      publishedAt: new Date().toISOString(),
      isLive: true,
      viewCount: '500',
      duration: 'PT24H'
    });
  });
  
  return allStreams;
}

// Function to get streams by category
function getStreamsByCategory(category) {
  if (!CUSTOM_VIDEO_LINKS[category]) {
    return [];
  }
  
  return CUSTOM_VIDEO_LINKS[category].map(stream => ({
    id: stream.id,
    title: stream.title,
    description: stream.description,
    thumbnail: `https://img.youtube.com/vi/${stream.videoId}/mqdefault.jpg`,
    streamUrl: `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`,
    channelTitle: stream.channelTitle,
    publishedAt: new Date().toISOString(),
    isLive: true,
    viewCount: '500',
    duration: 'PT24H'
  }));
}

module.exports = {
  CUSTOM_VIDEO_LINKS,
  getAllVideoStreams,
  getStreamsByCategory
};
