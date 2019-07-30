import os
import sys
import re
import tempfile
import subprocess
import argparse

OFFSET_PATTERN = re.compile(r'\d+_(\d+).jpg')

# setup argparse
parser = argparse.ArgumentParser(description='python utility to convert a collection of lecture slides from streams.tum.de into an mp4 that is in sync with the actual lecture recording')
parser.add_argument('slides_dir', help='Directory where the slides are stored')
parser.add_argument('video_path', help='Path of the downloaded lecture recording')
parser.add_argument('-output_dir', default='./', help='Output directory')
parser.add_argument('-keep-ffconcat', help="Don't delete the .ffconcat file", action='store_true')
args = parser.parse_args()


# create ffconcat file
tmp_f_fd, tmp_f_path = tempfile.mkstemp('.ffconcat')
print(f"ffconcat file: {tmp_f_path}")
tmp_f = os.fdopen(tmp_f_fd, 'w')
tmp_f.write("ffconcat version 1.0\n")
tmp_f.write(f"file {os.path.join(os.getcwd(), 'static/black.jpg')}\n")


# process slides
last_offset = 0
for filename in sorted(os.listdir(args.slides_dir)):
    offset = int(OFFSET_PATTERN.match(filename)[1]) / 1000
    tmp_f.write(f"duration {(offset - last_offset):.2f}\n")
    tmp_f.write(f"file '{os.path.join(args.slides_dir, filename)}'\n")
    last_offset = offset

# create video

total_duration = subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', args.video_path], encoding='ascii')

total_duration = int(total_duration.split('.')[0])

tmp_f.write(f"duration {total_duration - last_offset}\n")
tmp_f.close()

print("\n\ncreating video from slides...\n")
p = subprocess.run(['ffmpeg', '-safe', '0', '-i', tmp_f_path, '-vf', 'fps=4', os.path.join(args.output_dir, 'out.mp4')], stdout=subprocess.PIPE)
print(f"Done. Success: {p.returncode == 0}")

if not args.keep_ffconcat:
    os.remove(tmp_f_path)
