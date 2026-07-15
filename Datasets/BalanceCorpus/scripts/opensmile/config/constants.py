import subprocess
import os
# PATHS
BASE_PATH = subprocess.run(['cd .. && cd .. && pwd'], stdout=subprocess.PIPE, shell=True)
BASE_PATH = str(BASE_PATH.stdout).replace('b\'', '')
BASE_PATH = BASE_PATH.replace('\\n', '')
BASE_PATH = BASE_PATH.replace('\'', '')

print(BASE_PATH)

#mac
AUDIO_PATH = os.path.join(BASE_PATH, 'audios')
VIDEO_PATH = os.path.join(BASE_PATH, 'videos')
OUTPUT_PATH = os.path.join(BASE_PATH, 'opensmile_output')
