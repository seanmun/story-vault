#!/bin/bash
# Phase 4 render spike: title card + 5 Ken Burns scenes + crossfades + watermark.
# Text is pre-rendered by make_images.py (this ffmpeg lacks drawtext).
set -euo pipefail
cd "$(dirname "$0")"

python3 make_images.py

# Ken Burns clips — 4s each, alternating motion
DIRS=(
  "z='1.05+0.0012*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  "z='1.25-0.0012*on':x='(iw-iw/zoom)*(on/100)':y='ih/2-(ih/zoom/2)'"
  "z='1.15':x='(iw-iw/zoom)*(1-on/100)':y='(ih-ih/zoom)*(on/100)'"
  "z='1.05+0.0015*on':x='(iw-iw/zoom)':y='(ih-ih/zoom)*(1-on/100)'"
  "z='1.20-0.0008*on':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(on/100)'"
)
for i in 0 1 2 3 4; do
  ffmpeg -y -loglevel error -loop 1 -i "still$i.png" \
    -vf "zoompan=${DIRS[$i]}:d=100:s=1920x1080:fps=25,format=yuv420p" \
    -t 4 -c:v libx264 -preset fast "clip$i.mp4"
done

# Title clip: 4s, fade in
ffmpeg -y -loglevel error -loop 1 -i title.png \
  -vf "fps=25,fade=t=in:st=0:d=1,format=yuv420p" \
  -t 4 -c:v libx264 -preset fast "titleclip.mp4"

# Crossfade chain (0.5s) + watermark overlay, bottom-right, full duration
ffmpeg -y -loglevel error \
  -i titleclip.mp4 -i clip0.mp4 -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 -i clip4.mp4 -i wm.png \
  -filter_complex "\
  [0][1]xfade=transition=fade:duration=0.5:offset=3.5[v1]; \
  [v1][2]xfade=transition=fade:duration=0.5:offset=7.0[v2]; \
  [v2][3]xfade=transition=fade:duration=0.5:offset=10.5[v3]; \
  [v3][4]xfade=transition=fade:duration=0.5:offset=14.0[v4]; \
  [v4][5]xfade=transition=fade:duration=0.5:offset=17.5[v5]; \
  [v5][6]overlay=W-w-30:H-h-20,format=yuv420p[out]" \
  -map "[out]" -c:v libx264 -preset medium -crf 20 sample.mp4

rm -f still*.png clip*.mp4 titleclip.mp4 title.png wm.png
echo "done: $(pwd)/sample.mp4"
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 sample.mp4