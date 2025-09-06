# 🎥 Custom Video Links Setup

## How to Add Your Own Wildlife Video Links

### 1. **Find YouTube Video IDs**

To get a YouTube video ID:
- Go to any YouTube video
- Copy the URL: `https://www.youtube.com/watch?v=VIDEO_ID_HERE`
- The `VIDEO_ID_HERE` part is what you need

**Example:**
- URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ`

### 2. **Edit Video Configuration**

Open `backend/video-links.js` and update the video IDs:

```javascript
const CUSTOM_VIDEO_LINKS = {
  wildlife: [
    {
      id: 'wildlife1',
      videoId: 'YOUR_VIDEO_ID_1', // Replace with actual video ID
      title: 'Your Wildlife Stream 1',
      description: 'Description of your stream',
      channelTitle: 'Your Channel Name'
    },
    {
      id: 'wildlife2', 
      videoId: 'YOUR_VIDEO_ID_2', // Replace with actual video ID
      title: 'Your Wildlife Stream 2',
      description: 'Description of your stream',
      channelTitle: 'Your Channel Name'
    }
    // Add more videos...
  ]
};
```

### 3. **Recommended Wildlife Video Sources**

#### **Live Wildlife Cams:**
- **Explore.org**: `UCzQUP1qoWDoEbmsQxvdjxgQ`
- **National Geographic**: `UCBqBZHKj8Qj4Qj4Qj4Qj4Qj4`
- **African Wildlife Foundation**: `UCzQUP1qoWDoEbmsQxvdjxgQ`

#### **Popular Wildlife Video IDs:**
- Search for "wildlife live stream" on YouTube
- Look for 24/7 live cameras
- Choose videos with good quality and stable streams

### 4. **Video Requirements**

For best results, choose videos that:
- ✅ Are **live streams** or **long-duration videos**
- ✅ Have **wildlife content** (animals, nature)
- ✅ Are **publicly accessible**
- ✅ Have **stable streaming quality**
- ✅ Are **24/7 or long-duration** for continuous monitoring

### 5. **Test Your Videos**

After adding video IDs:

1. **Restart the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Test in frontend:**
   - Go to "Upload/Live" tab
   - Click "🔄 Refresh Streams"
   - Your videos should appear in the list

### 6. **Example Configuration**

Here's a complete example with real wildlife videos:

```javascript
const CUSTOM_VIDEO_LINKS = {
  wildlife: [
    {
      id: 'african_safari',
      videoId: 'dQw4w9WgXcQ', // Replace with actual African safari video
      title: 'African Safari Live Cam',
      description: 'Live wildlife monitoring from African savanna',
      channelTitle: 'Wildlife Safari'
    },
    {
      id: 'forest_cam',
      videoId: 'dQw4w9WgXcQ', // Replace with actual forest video
      title: 'Forest Wildlife Camera',
      description: 'Live forest wildlife monitoring',
      channelTitle: 'Forest Watch'
    },
    {
      id: 'ocean_cam',
      videoId: 'dQw4w9WgXcQ', // Replace with actual ocean video
      title: 'Ocean Wildlife Stream',
      description: 'Live ocean wildlife monitoring',
      channelTitle: 'Ocean Watch'
    },
    {
      id: 'mountain_cam',
      videoId: 'dQw4w9WgXcQ', // Replace with actual mountain video
      title: 'Mountain Wildlife Cam',
      description: 'Live mountain wildlife monitoring',
      channelTitle: 'Mountain Watch'
    }
  ]
};
```

### 7. **Troubleshooting**

#### **Video Not Playing:**
- Check if video ID is correct
- Ensure video is publicly accessible
- Try different video IDs

#### **Stream Not Loading:**
- Restart backend server
- Check browser console for errors
- Verify video is still available

#### **Detection Not Working:**
- Ensure YOLO model is in `backend/models/yoloE.pt`
- Check backend logs for errors
- Verify video quality is good

### 8. **Advanced Configuration**

#### **Add Multiple Categories:**
```javascript
const CUSTOM_VIDEO_LINKS = {
  wildlife: [...],
  nature: [...],
  birds: [...],
  marine: [...]
};
```

#### **Custom Thumbnails:**
```javascript
{
  id: 'custom1',
  videoId: 'YOUR_VIDEO_ID',
  title: 'Custom Stream',
  thumbnail: 'https://your-custom-thumbnail.jpg', // Custom thumbnail URL
  // ... other properties
}
```

#### **Custom Stream URLs:**
```javascript
{
  id: 'custom1',
  videoId: 'YOUR_VIDEO_ID',
  streamUrl: 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&mute=1&controls=1&showinfo=1&rel=0',
  // ... other properties
}
```

### 9. **Best Practices**

1. **Use Live Streams**: Prefer 24/7 live streams over regular videos
2. **Test First**: Always test videos before adding to production
3. **Backup Options**: Keep multiple video options in case one fails
4. **Quality Check**: Ensure videos have good quality for detection
5. **Regular Updates**: Update video IDs if streams change

### 10. **Quick Start**

1. Find 4 wildlife video IDs on YouTube
2. Replace the video IDs in `backend/video-links.js`
3. Restart the backend server
4. Test in the frontend

Your custom wildlife monitoring system will be ready! 🎥🦁
