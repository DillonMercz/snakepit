# Game Preview Video Setup

## Overview
The home page now includes a looped game preview video that plays behind the falling cash animation to showcase the gameplay.

## Video Requirements

### File Location
- Place video files in: `public/assets/`
- Supported formats:
  - `game-preview.mp4` (primary)
  - `game-preview.webm` (fallback)

### Video Specifications
- **Duration**: 30-60 seconds
- **Resolution**: 1920x1080 (1080p) minimum
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps or 60fps
- **Format**: MP4 (H.264) and WebM (VP9)
- **Audio**: None (muted)
- **Loop**: Seamless loop (start/end should match)

### Content Suggestions
Record gameplay footage showing:
1. **Snake movement and growth**
2. **Cash collection mechanics**
3. **AI snake interactions**
4. **Weapon combat (warfare mode)**
5. **Power-up collection**
6. **Boost mechanics**
7. **Multiple snakes on screen**

### Recording Tips
- Use screen recording software (OBS, etc.)
- Record at highest quality possible
- Ensure smooth 30-60fps
- Show exciting moments (combat, close calls)
- Include both game modes if possible
- Make it loop seamlessly

### Video Processing
```bash
# Convert to optimized MP4
ffmpeg -i raw-gameplay.mov -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart game-preview.mp4

# Convert to WebM
ffmpeg -i game-preview.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus game-preview.webm
```

## Fallback Display
If no video is found, an animated gradient background with game features will display instead.

## Current Status
- ✅ Video container implemented
- ✅ Fallback system ready
- ⏳ Actual gameplay video needed
- ⏳ Video files to be added to `/public/assets/`

## Implementation Details
- Video plays at 30% opacity with slight blur
- Z-index: 0 (behind falling cash and UI)
- Auto-plays, loops, and is muted
- Responsive and covers full screen
- Graceful fallback if video fails to load
