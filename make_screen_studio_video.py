import os
import sys
import asyncio
import subprocess
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import edge_tts
from scipy.io import wavfile
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
WORK_DIR = r"d:\icebergdb\screen_studio_build"
os.makedirs(WORK_DIR, exist_ok=True)

OUTPUT_VIDEO = r"d:\icebergdb\iceberg_saas_screen_studio_demo.mp4"
SAMPLE_RATE = 44100
FPS = 30
WIDTH = 1920
HEIGHT = 1080

# Windows fonts
FONT_BOLD_PATH = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG_PATH = r"C:\Windows\Fonts\segoeui.ttf"
FONT_MONO_PATH = r"C:\Windows\Fonts\consolab.ttf"

font_title = ImageFont.truetype(FONT_BOLD_PATH, 54)
font_h2 = ImageFont.truetype(FONT_BOLD_PATH, 38)
font_body = ImageFont.truetype(FONT_REG_PATH, 24)
font_mono = ImageFont.truetype(FONT_MONO_PATH, 22)
font_mono_lg = ImageFont.truetype(FONT_MONO_PATH, 28)
font_badge = ImageFont.truetype(FONT_BOLD_PATH, 16)
font_sm = ImageFont.truetype(FONT_REG_PATH, 18)


# Load captured authentic UI screenshots
landing_img = Image.open(r"d:\icebergdb\screenshot_landing.png").convert("RGB")
dash_img = Image.open(r"d:\icebergdb\screenshot_dashboard.png").convert("RGB")
api_img = Image.open(r"d:\icebergdb\screenshot_api.png").convert("RGB")

DEMO_SECTIONS = [
    {
        "id": "sec1_landing",
        "voice": "This is Iceberg Database—the serverless vector database built specifically for real-time AI and autonomous agents.",
        "duration": 9.0,
        "image": landing_img,
        "tag": "ZERO-CONFIG ONBOARDING",
        "cam_start": (960, 540, 1.0),
        "cam_end": (580, 420, 1.45),
        "cursor_start": (800, 700),
        "cursor_target": (420, 480),
        "click_at": 5.5,
    },
    {
        "id": "sec2_dashboard",
        "voice": "Inside the Iceberg Cloud Console, deploy and scale isolated vector collections with sub-five-millisecond query latencies, fully hosted in Mumbai.",
        "duration": 10.0,
        "image": dash_img,
        "tag": "MUMBAI BARE-METAL CLOUD",
        "cam_start": (960, 540, 1.05),
        "cam_end": (750, 450, 1.55),
        "cursor_start": (400, 300),
        "cursor_target": (850, 420),
        "click_at": 6.0,
    },
    {
        "id": "sec3_query",
        "voice": "Execute hybrid search combining dense FastEmbed vectors with BM25 keyword matching. Results return in under four milliseconds with zero cold starts.",
        "duration": 10.0,
        "image": landing_img,
        "tag": "SUB-5MS QUERY EXECUTION",
        "cam_start": (1200, 520, 1.1),
        "cam_end": (1350, 540, 1.65),
        "cursor_start": (1100, 480),
        "cursor_target": (1350, 420),
        "click_at": 4.5,
    },
    {
        "id": "sec4_api",
        "voice": "Connect effortlessly using our native Python, Rust, and TypeScript SDKs, or query directly via our high-speed OpenAPI REST endpoints.",
        "duration": 9.0,
        "image": api_img,
        "tag": "MULTI-LANGUAGE SDks & REST",
        "cam_start": (960, 540, 1.0),
        "cam_end": (700, 420, 1.4),
        "cursor_start": (450, 600),
        "cursor_target": (620, 380),
        "click_at": 5.0,
    },
    {
        "id": "sec5_outro",
        "voice": "Get started today. Index up to 500,000 vectors completely free forever. Visit icebergdb.io and deploy your cluster in sixty seconds.",
        "duration": 8.0,
        "image": landing_img,
        "tag": "START BUILDING FREE",
        "cam_start": (700, 450, 1.4),
        "cam_end": (960, 540, 1.0),
        "cursor_start": (620, 380),
        "cursor_target": (960, 540),
        "click_at": 4.0,
    }
]

# ── 1. Voiceover Synthesis ──
async def generate_voiceovers():
    print("[1/4] Generating Studio Founder Voiceover...")
    wav_files = []
    for i, sec in enumerate(DEMO_SECTIONS):
        mp3_path = os.path.join(WORK_DIR, f"voice_{i}.mp3")
        wav_path = os.path.join(WORK_DIR, f"voice_{i}.wav")
        print(f"  Synthesizing section {i+1}...")
        comm = edge_tts.Communicate(sec["voice"], "en-US-ChristopherNeural", rate="+6%")
        await comm.save(mp3_path)
        subprocess.run(
            [FFMPEG_EXE, "-y", "-i", mp3_path, "-ar", str(SAMPLE_RATE), "-ac", "1", wav_path],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        wav_files.append(wav_path)
    return wav_files

# ── 2. Screen Studio Sound Design (Typing, Clicks, Beats) ──
def create_soundtrack(wav_files):
    print("[2/4] Synthesizing Screen Studio Audio (Mechanical Clicks + Upbeat Tech Track)...")
    total_dur = sum(s["duration"] for s in DEMO_SECTIONS)
    total_samples = int(total_dur * SAMPLE_RATE)
    
    music_l = np.zeros(total_samples, dtype=np.float32)
    music_r = np.zeros(total_samples, dtype=np.float32)

    # 116 BPM Lo-Fi Tech Beat
    bpm = 116.0
    beat_dur = 60.0 / bpm
    total_beats = int(total_dur / beat_dur)

    for b in range(total_beats):
        b_time = b * beat_dur
        s_idx = int(b_time * SAMPLE_RATE)
        # Warm punchy kick
        k_dur = 0.18
        k_samples = int(k_dur * SAMPLE_RATE)
        if s_idx + k_samples < total_samples:
            kt = np.linspace(0, k_dur, k_samples, endpoint=False)
            k_freq = 120.0 * np.exp(-14.0 * kt) + 42.0
            phase = 2.0 * np.pi * np.cumsum(k_freq) / SAMPLE_RATE
            kick = np.sin(phase) * np.exp(-10.0 * kt) * 0.28
            music_l[s_idx:s_idx+k_samples] += kick
            music_r[s_idx:s_idx+k_samples] += kick

        # Subtle snare on beats 2 and 4
        if b % 2 == 1:
            sn_dur = 0.12
            sn_samples = int(sn_dur * SAMPLE_RATE)
            if s_idx + sn_samples < total_samples:
                noise = (np.random.rand(sn_samples) * 2 - 1) * np.exp(-np.linspace(0, 18, sn_samples)) * 0.09
                music_l[s_idx:s_idx+sn_samples] += noise
                music_r[s_idx:s_idx+sn_samples] += noise

    # Ambient Rhodes / Synth Chords (F#m7 - Bm7 - C#m7)
    chords = [
        [185.0, 220.0, 277.18, 370.0],
        [246.94, 293.66, 370.0, 440.0],
        [277.18, 329.63, 415.3, 554.37],
    ]
    for c_idx, chord in enumerate(chords * 6):
        c_time = c_idx * (beat_dur * 4.0)
        s_idx = int(c_time * SAMPLE_RATE)
        c_dur = beat_dur * 3.8
        c_samples = int(c_dur * SAMPLE_RATE)
        if s_idx + c_samples < total_samples:
            ct = np.linspace(0, c_dur, c_samples, endpoint=False)
            sig = np.zeros(c_samples, dtype=np.float32)
            for f in chord:
                sig += np.sin(2 * np.pi * f * ct) * np.exp(-0.8 * ct)
            sig = (sig / len(chord)) * 0.08
            music_l[s_idx:s_idx+c_samples] += sig
            music_r[s_idx:s_idx+c_samples] += sig

    # Add Tactile Sound Effects (Mouse Clicks & Typing)
    cur_sec_start = 0.0
    for s_idx, sec in enumerate(DEMO_SECTIONS):
        # Click sound at click_at
        click_time = cur_sec_start + sec["click_at"]
        click_idx = int(click_time * SAMPLE_RATE)
        cl_dur = 0.04
        cl_samples = int(cl_dur * SAMPLE_RATE)
        if click_idx + cl_samples < total_samples:
            clt = np.linspace(0, cl_dur, cl_samples, endpoint=False)
            click_snd = np.sin(2 * np.pi * 1800.0 * clt) * np.exp(-120.0 * clt) * 0.4
            music_l[click_idx:click_idx+cl_samples] += click_snd
            music_r[click_idx:click_idx+cl_samples] += click_snd

        # Transition Whoosh
        if s_idx < len(DEMO_SECTIONS) - 1:
            trans_time = cur_sec_start + sec["duration"] - 0.4
            w_idx = int(trans_time * SAMPLE_RATE)
            w_dur = 0.5
            w_samples = int(w_dur * SAMPLE_RATE)
            if w_idx > 0 and w_idx + w_samples < total_samples:
                wt = np.linspace(0, w_dur, w_samples, endpoint=False)
                whoosh = np.sin(2 * np.pi * (200.0 + 800.0 * wt**2) * wt) * np.sin(np.pi * wt / w_dur) * 0.12
                music_l[w_idx:w_idx+w_samples] += whoosh
                music_r[w_idx:w_idx+w_samples] += whoosh

        cur_sec_start += sec["duration"]

    # Overlay Voiceovers with Ducking
    master_l = music_l * 0.4
    master_r = music_r * 0.4

    cur_time = 0.35
    for i, wav_path in enumerate(wav_files):
        rate, voice_data = wavfile.read(wav_path)
        if voice_data.dtype == np.int16:
            v_float = voice_data.astype(np.float32) / 32768.0
        else:
            v_float = voice_data.astype(np.float32)

        start_idx = int(cur_time * SAMPLE_RATE)
        end_idx = min(start_idx + len(v_float), total_samples)
        v_slice = v_float[:end_idx - start_idx]

        master_l[start_idx:end_idx] += v_slice * 0.95
        master_r[start_idx:end_idx] += v_slice * 0.95

        cur_time += DEMO_SECTIONS[i]["duration"]

    # Normalize
    max_amp = max(np.max(np.abs(master_l)), np.max(np.abs(master_r)), 0.01)
    if max_amp > 0.92:
        master_l = (master_l / max_amp) * 0.92
        master_r = (master_r / max_amp) * 0.92

    master_stereo = np.column_stack((master_l, master_r))
    final_audio = os.path.join(WORK_DIR, "screen_studio_soundtrack.wav")
    wavfile.write(final_audio, SAMPLE_RATE, (master_stereo * 32767.0).astype(np.int16))
    return final_audio

# ── 3. Screen Studio Camera & Cursor Animation ──
def render_screen_studio_frame(draw_surface, sec, local_t, total_f, frame_idx):
    dur = sec["duration"]
    norm_t = min(1.0, max(0.0, local_t / dur))
    
    # Smooth Hermite S-Curve for cinematic camera motion
    ease_cam = norm_t * norm_t * (3.0 - 2.0 * norm_t)

    # Interpolate camera target and zoom
    cx_s, cy_s, zoom_s = sec["cam_start"]
    cx_e, cy_e, zoom_e = sec["cam_end"]

    cur_cx = cx_s + (cx_e - cx_s) * ease_cam
    cur_cy = cy_s + (cy_e - cy_s) * ease_cam
    cur_zoom = zoom_s + (zoom_e - zoom_s) * ease_cam

    # 1. Background studio backdrop
    draw = ImageDraw.Draw(draw_surface)
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(10, 11, 16))
    
    # Radial ambient studio glow behind window
    for rad in range(600, 200, -80):
        alpha = int((1.0 - rad / 600.0) * 20)
        draw.ellipse([WIDTH//2 - rad, HEIGHT//2 - int(rad*0.6), WIDTH//2 + rad, HEIGHT//2 + int(rad*0.6)], outline=(20, 35, 60))

    # 2. Crop and scale captured image according to virtual camera
    crop_w = int(WIDTH / cur_zoom)
    crop_h = int(HEIGHT / cur_zoom)
    x1 = max(0, min(int(cur_cx - crop_w // 2), WIDTH - crop_w))
    y1 = max(0, min(int(cur_cy - crop_h // 2), HEIGHT - crop_h))
    x2 = x1 + crop_w
    y2 = y1 + crop_h

    cropped = sec["image"].crop((x1, y1, x2, y2))
    
    # Render with macOS styled floating window margins
    window_margin_x = 80
    window_margin_y = 70
    win_w = WIDTH - window_margin_x * 2
    win_h = HEIGHT - window_margin_y * 2
    
    resized_view = cropped.resize((win_w, win_h), Image.Resampling.BILINEAR)
    draw_surface.paste(resized_view, (window_margin_x, window_margin_y))

    # Window border & shadow outline
    draw.rectangle([window_margin_x, window_margin_y, window_margin_x + win_w, window_margin_y + win_h], outline=(45, 50, 70), width=2)
    
    # macOS Window Buttons
    draw.ellipse([window_margin_x + 18, window_margin_y + 14, window_margin_x + 28, window_margin_y + 24], fill=(255, 95, 87))
    draw.ellipse([window_margin_x + 34, window_margin_y + 14, window_margin_x + 44, window_margin_y + 24], fill=(254, 188, 46))
    draw.ellipse([window_margin_x + 50, window_margin_y + 14, window_margin_x + 60, window_margin_y + 24], fill=(40, 200, 64))

    # 3. Kinetic Title Overlay Card (Bottom-Left)
    draw.rounded_rectangle([window_margin_x + 30, window_margin_y + win_h - 90, window_margin_x + 540, window_margin_y + win_h - 25], radius=14, fill=(13, 16, 24), outline=(56, 189, 248), width=1)
    draw.text((window_margin_x + 50, window_margin_y + win_h - 78), f"●  {sec['tag']}", fill=(56, 189, 248), font=font_badge)
    draw.text((window_margin_x + 50, window_margin_y + win_h - 52), "Iceberg Vector Infrastructure", fill=(200, 205, 220), font=font_sm)

    # 4. Smooth Mouse Cursor & Click Ripple
    cur_x_s, cur_y_s = sec["cursor_start"]
    cur_x_e, cur_y_e = sec["cursor_target"]
    
    # Cursor moves between 1.0s and click_at
    move_t = min(1.0, max(0.0, (local_t - 0.8) / (sec["click_at"] - 0.8)))
    ease_cursor = move_t * move_t * (3.0 - 2.0 * move_t)
    
    cursor_x = cur_x_s + (cur_x_e - cur_x_s) * ease_cursor
    cursor_y = cur_y_s + (cur_y_e - cur_y_s) * ease_cursor
    
    # Convert global image coords to screen coords
    screen_cur_x = int(window_margin_x + (cursor_x - x1) * (win_w / crop_w))
    screen_cur_y = int(window_margin_y + (cursor_y - y1) * (win_h / crop_h))

    # Click Ripple Effect
    if local_t >= sec["click_at"] and local_t <= sec["click_at"] + 0.6:
        ripple_t = (local_t - sec["click_at"]) / 0.6
        rip_r = int(ripple_t * 45)
        rip_alpha = int((1.0 - ripple_t) * 255)
        draw.ellipse([screen_cur_x - rip_r, screen_cur_y - rip_r, screen_cur_x + rip_r, screen_cur_y + rip_r], outline=(56, 189, 248), width=3)

    # Draw Sleek Modern Cursor Pointer
    cx, cy = screen_cur_x, screen_cur_y
    draw.polygon([(cx, cy), (cx + 18, cy + 18), (cx + 9, cy + 18), (cx + 14, cy + 28), (cx + 9, cy + 30), (cx + 4, cy + 20), (cx, cy + 23)], fill=(255, 255, 255), outline=(0, 0, 0), width=1)

    # Overall progress bar at bottom
    total_frames = int(sum(s["duration"] for s in DEMO_SECTIONS) * FPS)
    prog = frame_idx / total_frames
    draw.line([(0, HEIGHT - 6), (WIDTH, HEIGHT - 6)], fill=(20, 24, 32), width=6)
    draw.line([(0, HEIGHT - 6), (int(WIDTH * prog), HEIGHT - 6)], fill=(56, 189, 248), width=6)

# ── 4. Main Compiler ──
async def build_screen_studio_video():
    wav_files = await generate_voiceovers()
    audio_path = create_soundtrack(wav_files)

    print("[3/4] Rendering 1080p Screen Studio Cinematic Frames into FFmpeg...")
    total_dur = sum(s["duration"] for s in DEMO_SECTIONS)
    total_frames = int(total_dur * FPS)

    cmd = [
        FFMPEG_EXE,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", audio_path,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "17",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    sec_starts = []
    acc = 0
    for s in DEMO_SECTIONS:
        sec_starts.append(acc)
        acc += int(s["duration"] * FPS)
    sec_starts.append(acc)

    frame_canvas = Image.new("RGB", (WIDTH, HEIGHT), (10, 11, 16))

    for f in range(total_frames):
        if f % 120 == 0:
            pct = int((f / total_frames) * 100)
            print(f"  Rendering Screen Studio frame {f}/{total_frames} ({pct}%)...")

        cur_idx = 0
        for i in range(len(DEMO_SECTIONS)):
            if f >= sec_starts[i]:
                cur_idx = i

        sec = DEMO_SECTIONS[cur_idx]
        local_f = f - sec_starts[cur_idx]
        local_t = local_f / FPS

        render_screen_studio_frame(frame_canvas, sec, local_t, total_frames, f)
        proc.stdin.write(frame_canvas.tobytes())

    proc.stdin.close()
    proc.wait()

    mb_size = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
    print(f"\n[4/4] SUCCESS! Screen Studio SaaS Walkthrough Video Created:")
    print(f"  File: {OUTPUT_VIDEO}")
    print(f"  Duration: {total_dur:.1f} seconds")
    print(f"  Size: {mb_size:.2f} MB")

if __name__ == "__main__":
    asyncio.run(build_screen_studio_video())
