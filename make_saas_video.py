import os
import sys
import asyncio
import subprocess
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import edge_tts
from scipy.io import wavfile
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
WORK_DIR = r"d:\icebergdb\video_build"
os.makedirs(WORK_DIR, exist_ok=True)

FINAL_OUTPUT = r"d:\icebergdb\iceberg_saas_product_launch.mp4"
SAMPLE_RATE = 44100
FPS = 30
WIDTH = 1920
HEIGHT = 1080

# Windows fonts
FONT_BOLD_PATH = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG_PATH = r"C:\Windows\Fonts\segoeui.ttf"
FONT_MONO_PATH = r"C:\Windows\Fonts\consolab.ttf"

font_title = ImageFont.truetype(FONT_BOLD_PATH, 58)
font_h2 = ImageFont.truetype(FONT_BOLD_PATH, 42)
font_h3 = ImageFont.truetype(FONT_BOLD_PATH, 32)
font_body = ImageFont.truetype(FONT_REG_PATH, 24)
font_mono = ImageFont.truetype(FONT_MONO_PATH, 22)
font_mono_lg = ImageFont.truetype(FONT_MONO_PATH, 28)
font_sm = ImageFont.truetype(FONT_REG_PATH, 18)
font_badge = ImageFont.truetype(FONT_BOLD_PATH, 16)

SCENE_CONFIGS = [
    {
        "id": "scene1_problem",
        "text": "In the era of autonomous AI and real-time inference, traditional vector databases are broken. Crippling cross-border latency, sleep timeouts, and data residency headaches.",
        "duration_sec": 7.5,
    },
    {
        "id": "scene2_reveal",
        "text": "Introducing Iceberg. The serverless vector database engineered for extreme speed, scale, and compliance.",
        "duration_sec": 7.5,
    },
    {
        "id": "scene3_rust",
        "text": "Built in Rust with native SIMD AVX-512 acceleration, Iceberg executes memory-mapped HNSW graph search with zero cold starts.",
        "duration_sec": 8.0,
    },
    {
        "id": "scene4_benchmark",
        "text": "Colocated in Mumbai IDC-2, Iceberg delivers sub-5ms p99 latency—over fifty times faster than US-hosted databases, with one hundred percent data sovereignty under the DPDP Act.",
        "duration_sec": 8.5,
    },
    {
        "id": "scene5_memory",
        "text": "Equip your AI agents with 4-tier persistent memory, hybrid dense plus BM25 search, and unified APIs for Python, Rust, and TypeScript.",
        "duration_sec": 8.0,
    },
    {
        "id": "scene6_outro",
        "text": "Deploy your first cluster in sixty seconds. Index 500,000 vectors completely free. Visit icebergdb.io today.",
        "duration_sec": 8.5,
    }
]

# ── 1. Voiceover Generation ──
async def generate_voiceovers():
    print("[1/4] Generating Studio Neural Voiceovers...")
    wav_files = []
    for i, sc in enumerate(SCENE_CONFIGS):
        mp3_path = os.path.join(WORK_DIR, f"voice_{i}.mp3")
        wav_path = os.path.join(WORK_DIR, f"voice_{i}.wav")
        print(f"  Generating Scene {i+1} voice...")
        comm = edge_tts.Communicate(sc["text"], "en-US-ChristopherNeural", rate="+6%")
        await comm.save(mp3_path)
        subprocess.run(
            [FFMPEG_EXE, "-y", "-i", mp3_path, "-ar", str(SAMPLE_RATE), "-ac", "1", wav_path],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        wav_files.append(wav_path)
    return wav_files

# ── 2. Sound Effects & Music Synthesis ──
def create_soundtrack(wav_files):
    print("[2/4] Synthesizing Cyber Synth Music & Sound FX...")
    total_duration = sum(sc["duration_sec"] for sc in SCENE_CONFIGS)
    total_samples = int(total_duration * SAMPLE_RATE)
    
    # Base stereo array
    music_l = np.zeros(total_samples, dtype=np.float32)
    music_r = np.zeros(total_samples, dtype=np.float32)
    t = np.linspace(0, total_duration, total_samples, endpoint=False)
    
    # 120 BPM Cyber Beat (0.5s per beat)
    bpm = 124.0
    beat_dur = 60.0 / bpm
    total_beats = int(total_duration / beat_dur)
    
    # A) Synth Kick Drum on beats
    for b in range(total_beats):
        b_time = b * beat_dur
        start_idx = int(b_time * SAMPLE_RATE)
        kick_dur = 0.22
        kick_samples = int(kick_dur * SAMPLE_RATE)
        if start_idx + kick_samples < total_samples:
            kt = np.linspace(0, kick_dur, kick_samples, endpoint=False)
            freq = 140.0 * np.exp(-18.0 * kt) + 38.0
            phase = 2.0 * np.pi * np.cumsum(freq) / SAMPLE_RATE
            kick = np.sin(phase) * np.exp(-12.0 * kt) * 0.35
            music_l[start_idx:start_idx+kick_samples] += kick
            music_r[start_idx:start_idx+kick_samples] += kick

    # B) Hi-Hat on off-beats
    for b in range(total_beats * 2):
        if b % 2 == 1:
            b_time = b * (beat_dur / 2.0)
            start_idx = int(b_time * SAMPLE_RATE)
            hh_dur = 0.05
            hh_samples = int(hh_dur * SAMPLE_RATE)
            if start_idx + hh_samples < total_samples:
                noise = (np.random.rand(hh_samples) * 2 - 1) * np.exp(-np.linspace(0, 15, hh_samples)) * 0.08
                music_l[start_idx:start_idx+hh_samples] += noise * 0.8
                music_r[start_idx:start_idx+hh_samples] += noise * 1.2

    # C) Cyber Synth Arpeggio (F# Minor progression)
    notes = [185.0, 220.0, 277.18, 329.63, 370.0, 440.0, 554.37]
    for step in range(total_beats * 4):
        s_time = step * (beat_dur / 4.0)
        start_idx = int(s_time * SAMPLE_RATE)
        note_freq = notes[step % len(notes)]
        note_dur = 0.16
        n_samples = int(note_dur * SAMPLE_RATE)
        if start_idx + n_samples < total_samples:
            nt = np.linspace(0, note_dur, n_samples, endpoint=False)
            arp = (np.sin(2 * np.pi * note_freq * nt) + 0.3 * np.sin(4 * np.pi * note_freq * nt)) * np.exp(-14.0 * nt) * 0.12
            pan = 0.5 + 0.3 * np.sin(step * 0.8)
            music_l[start_idx:start_idx+n_samples] += arp * pan
            music_r[start_idx:start_idx+n_samples] += arp * (1.0 - pan)

    # D) Sub-bass Drone on scene 2 reveal
    scene2_start = int(SCENE_CONFIGS[0]["duration_sec"] * SAMPLE_RATE)
    sub_dur = 4.0
    sub_samples = int(sub_dur * SAMPLE_RATE)
    if scene2_start + sub_samples < total_samples:
        st = np.linspace(0, sub_dur, sub_samples, endpoint=False)
        sub = np.sin(2 * np.pi * 45.0 * st) * np.exp(-0.8 * st) * 0.45
        music_l[scene2_start:scene2_start+sub_samples] += sub
        music_r[scene2_start:scene2_start+sub_samples] += sub

    # E) Transition Whoosh Risers between scenes
    cur_time = 0.0
    for sc in SCENE_CONFIGS[:-1]:
        cur_time += sc["duration_sec"]
        trans_start = int((cur_time - 0.75) * SAMPLE_RATE)
        trans_dur = 0.75
        ts_samples = int(trans_dur * SAMPLE_RATE)
        if trans_start > 0 and trans_start + ts_samples < total_samples:
            tt = np.linspace(0, trans_dur, ts_samples, endpoint=False)
            sweep_freq = 150.0 + 1200.0 * (tt / trans_dur)**2
            phase = 2.0 * np.pi * np.cumsum(sweep_freq) / SAMPLE_RATE
            whoosh = np.sin(phase) * (tt / trans_dur) * 0.18
            music_l[trans_start:trans_start+ts_samples] += whoosh
            music_r[trans_start:trans_start+ts_samples] += whoosh

    # F) Overlay Voiceovers with Ducking
    master_l = music_l * 0.35
    master_r = music_r * 0.35
    
    cur_time = 0.4
    for i, wav_path in enumerate(wav_files):
        rate, voice_data = wavfile.read(wav_path)
        if voice_data.dtype == np.int16:
            voice_float = voice_data.astype(np.float32) / 32768.0
        else:
            voice_float = voice_data.astype(np.float32)
            
        start_idx = int(cur_time * SAMPLE_RATE)
        end_idx = min(start_idx + len(voice_float), total_samples)
        v_slice = voice_float[:end_idx - start_idx]
        
        # Add voice with full clarity
        master_l[start_idx:end_idx] += v_slice * 0.95
        master_r[start_idx:end_idx] += v_slice * 0.95
        
        cur_time += SCENE_CONFIGS[i]["duration_sec"]

    # Normalize audio to prevent clipping
    max_amp = max(np.max(np.abs(master_l)), np.max(np.abs(master_r)), 0.01)
    if max_amp > 0.92:
        master_l = (master_l / max_amp) * 0.92
        master_r = (master_r / max_amp) * 0.92

    master_stereo = np.column_stack((master_l, master_r))
    master_int16 = (master_stereo * 32767.0).astype(np.int16)
    
    final_audio_path = os.path.join(WORK_DIR, "master_soundtrack.wav")
    wavfile.write(final_audio_path, SAMPLE_RATE, master_int16)
    print(f"  Soundtrack synthesized: {final_audio_path}")
    return final_audio_path

# ── 3. Frame Drawing Routines ──
def draw_base_background(draw, frame_idx):
    # Deep obsidian background
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(8, 9, 13))
    
    # High-tech ambient grid lines
    for x in range(0, WIDTH, 120):
        draw.line([(x, 0), (x, HEIGHT)], fill=(18, 20, 28), width=1)
    for y in range(0, HEIGHT, 120):
        draw.line([(0, y), (WIDTH, y)], fill=(18, 20, 28), width=1)

    # Top HUD Bar
    draw.line([(0, 64), (WIDTH, 64)], fill=(28, 32, 45), width=1)
    draw.rectangle([40, 20, 54, 34], fill=(37, 99, 235))
    draw.text((64, 22), "ICEBERG // HIGH-PERFORMANCE VECTOR INFRASTRUCTURE", fill=(140, 144, 165), font=font_sm)
    
    time_str = f"NODE: ap-south-1 (Mumbai)  |  SIMD: AVX-512  |  p99: 3.2ms"
    draw.text((WIDTH - 540, 22), time_str, fill=(74, 222, 128), font=font_mono)

    # Bottom Progress Bar
    total_frames = int(sum(sc["duration_sec"] for sc in SCENE_CONFIGS) * FPS)
    progress = frame_idx / total_frames
    draw.line([(0, HEIGHT - 8), (WIDTH, HEIGHT - 8)], fill=(20, 22, 30), width=8)
    draw.line([(0, HEIGHT - 8), (int(WIDTH * progress), HEIGHT - 8)], fill=(56, 189, 248), width=8)

def render_scene_1(draw, t, dur):
    # The Problem
    draw_badge(draw, 140, 130, "THE INFRASTRUCTURE BOTTLENECK", (239, 68, 68))
    draw.text((140, 170), "Traditional Vector Databases\nAre Failing Real-Time AI.", fill=(255, 255, 255), font=font_title)
    
    # 3 Flaw cards
    flaws = [
        ("185ms Latency Across Oceans", "Trans-Atlantic network routing kills real-time agent loops.", (248, 113, 113)),
        ("Cold Starts & Sleep Cycles", "Unpredictable 15-30s container spin-ups drop production traffic.", (251, 146, 60)),
        ("DPDP Act Compliance Risk", "Cross-border vector telemetry violates Indian data sovereignty.", (248, 113, 113)),
    ]
    for i, (head, desc, col) in enumerate(flaws):
        y = 360 + i * 140
        slide = min(1.0, max(0.0, (t - i * 0.4) * 2.5))
        x_offset = int((1.0 - slide) * 80)
        draw.rounded_rectangle([140 + x_offset, y, 1780, y + 110], radius=12, fill=(15, 17, 24), outline=(40, 44, 60), width=1)
        draw.text((170 + x_offset, y + 22), f"✕  {head}", fill=col, font=font_h3)
        draw.text((170 + x_offset, y + 68), desc, fill=(160, 164, 180), font=font_body)

def render_scene_2(draw, t, dur):
    # Iceberg Reveal
    scale = min(1.0, t * 1.8)
    draw_badge(draw, 140, 140, "NEXT-GENERATION SYSTEMS ENGINE", (56, 189, 248))
    
    # Big Title
    draw.text((140, 180), "Meet Iceberg Database.", fill=(255, 255, 255), font=font_title)
    draw.text((140, 260), "The Serverless Vector Engine Engineered for Real-Time AI.", fill=(96, 165, 250), font=font_h2)

    # Central Glowing Crystal Logo
    cx, cy = 960, 580
    r = int(140 * scale)
    if r > 10:
        draw.ellipse([cx - r - 40, cy - r - 40, cx + r + 40, cy + r + 40], outline=(37, 99, 235), width=2)
        draw.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=(15, 23, 42), outline=(56, 189, 248), width=3)
        draw.polygon([(cx, cy - r), (cx + int(r*0.6), cy), (cx, cy + r), (cx - int(r*0.6), cy)], fill=(30, 58, 138), outline=(147, 197, 253), width=2)
    
    # 3 Key Value Props below
    pills = [
        ("Sub-5ms p99 Latency", (74, 222, 128)),
        ("Rust & SIMD AVX-512 Core", (56, 189, 248)),
        ("100% Indian Data Sovereignty (DPDP 2023)", (168, 85, 247)),
    ]
    for i, (pill, pcol) in enumerate(pills):
        px = 280 + i * 460
        draw.rounded_rectangle([px, 840, px + 420, 910], radius=16, fill=(18, 22, 34), outline=(45, 52, 75), width=1)
        draw.text((px + 30, 862), f"✓ {pill}", fill=pcol, font=font_mono)

def render_scene_3(draw, t, dur):
    # Rust Core & SIMD
    draw_badge(draw, 140, 130, "HARDWARE-VECTORIZED EXECUTION", (168, 85, 247))
    draw.text((140, 170), "Memory-Mapped Graphs on NVMe.", fill=(255, 255, 255), font=font_title)
    
    # Split IDE Console
    # Left Code Box
    draw.rounded_rectangle([140, 270, 1080, 880], radius=16, fill=(12, 14, 20), outline=(35, 40, 56), width=1)
    draw.rectangle([140, 270, 1080, 320], fill=(18, 21, 30))
    draw.text((170, 286), "query_execution.rs", fill=(160, 165, 185), font=font_mono)
    
    code_lines = [
        ("// High-Throughput Rust Vector Search Client", (100, 110, 130)),
        ("use iceberg_rs::{Client, Query};", (192, 132, 252)),
        ("", (255, 255, 255)),
        ("let client = Client::connect(\"ap-south-1.icebergdb.io\").await?;", (147, 197, 253)),
        ("let results = client.search(\"orderbook_signals\")", (147, 197, 253)),
        ("    .vector(&query_embedding)", (244, 114, 182)),
        ("    .filter(doc! { \"exchange\": \"NSE\" })", (74, 222, 128)),
        ("    .limit(5)", (251, 191, 36)),
        ("    .execute().await?;", (147, 197, 253)),
        ("", (255, 255, 255)),
        ("println!(\"p99 Latency: {}ms\", results.latency_ms);", (74, 222, 128)),
    ]
    chars_to_show = int(t * 70)
    cur_chars = 0
    for idx, (line, lcol) in enumerate(code_lines):
        ly = 350 + idx * 44
        if cur_chars < chars_to_show:
            show_len = min(len(line), chars_to_show - cur_chars)
            draw.text((170, ly), line[:show_len], fill=lcol, font=font_mono)
            cur_chars += len(line)

    # Right Telemetry Stats
    draw.rounded_rectangle([1120, 270, 1780, 880], radius=16, fill=(12, 14, 20), outline=(35, 40, 56), width=1)
    draw.rectangle([1120, 270, 1780, 320], fill=(18, 21, 30))
    draw.text((1150, 286), "KERNEL TELEMETRY (LIVE)", fill=(74, 222, 128), font=font_mono)
    
    stats = [
        ("Execution Engine", "Rust 1.80 (Zero Page Faults)"),
        ("SIMD Vector Unit", "AVX-512 ACTIVE (FMA3)"),
        ("HNSW Graph Core", "M=16, ef_search=128"),
        ("Cold Start Penalty", "0.0 ms (Kernel mmap Warm)"),
        ("Active p99 Latency", "3.2 ms"),
        ("Data Sovereignty", "Mumbai IDC-2 (DPDP Act)"),
    ]
    for i, (k, v) in enumerate(stats):
        sy = 360 + i * 82
        draw.text((1150, sy), k, fill=(140, 144, 160), font=font_body)
        draw.text((1150, sy + 32), v, fill=(255, 255, 255) if "3.2" not in v else (74, 222, 128), font=font_mono_lg)

def render_scene_4(draw, t, dur):
    # The Benchmark
    draw_badge(draw, 140, 130, "VERIFIED PRODUCTION BENCHMARK", (74, 222, 128))
    draw.text((140, 170), "58x Lower Query Latency.", fill=(255, 255, 255), font=font_title)
    draw.text((140, 250), "Average p99 End-to-End Latency for Indian AI Applications", fill=(150, 155, 175), font=font_body)
    
    # Animated Comparison Bars
    anim_progress = min(1.0, t * 1.5)
    
    # 1. Iceberg Bar
    draw.text((140, 340), "Iceberg Database (Mumbai, ap-south-1)", fill=(255, 255, 255), font=font_h3)
    bar1_w = int(120 * anim_progress)
    draw.rounded_rectangle([140, 390, 140 + max(bar1_w, 20), 460], radius=10, fill=(34, 197, 94))
    draw.text((140 + bar1_w + 30, 405), "3.2 ms  [VERIFIED p99]", fill=(74, 222, 128), font=font_mono_lg)

    # 2. US Provider 1
    draw.text((140, 520), "Pinecone Serverless (US-East-1, Virginia)", fill=(160, 165, 180), font=font_h3)
    bar2_w = int(1100 * anim_progress)
    draw.rounded_rectangle([140, 570, 140 + max(bar2_w, 20), 640], radius=10, fill=(75, 85, 99))
    draw.text((140 + bar2_w + 30, 585), "185.0 ms  (Trans-Atlantic Delay)", fill=(160, 165, 180), font=font_mono_lg)

    # 3. US Provider 2
    draw.text((140, 700), "Weaviate Cloud (US-Central)", fill=(160, 165, 180), font=font_h3)
    bar3_w = int(1200 * anim_progress)
    draw.rounded_rectangle([140, 750, 140 + max(bar3_w, 20), 820], radius=10, fill=(55, 65, 81))
    draw.text((140 + bar3_w + 30, 765), "198.0 ms", fill=(160, 165, 180), font=font_mono_lg)

    # Bottom Callout Banner
    draw.rounded_rectangle([140, 880, 1780, 960], radius=12, fill=(15, 23, 42), outline=(37, 99, 235), width=1)
    draw.text((180, 905), "⚡ 58x Lower Latency  •  Zero Foreign Currency Exchange Risks  •  Flat INR Pricing with GST Invoices", fill=(147, 197, 253), font=font_mono)

def render_scene_5(draw, t, dur):
    # 4-Tier Agent Memory
    draw_badge(draw, 140, 130, "STATEFUL AUTONOMOUS AGENTS", (56, 189, 248))
    draw.text((140, 170), "Unified 4-Tier Persistent Memory.", fill=(255, 255, 255), font=font_title)
    
    cards = [
        ("Tier 1: Working Session Memory", "1-Hour Auto-Expiring TTL", "Stores transient conversation context without manual database cleanup.", (56, 189, 248)),
        ("Tier 2: Episodic Interaction Logs", "30-Day Snapshot Retention", "Preserves user audit trails, event sequences, and tool call histories.", (168, 85, 247)),
        ("Tier 3: Semantic Knowledge Graph", "Hybrid Dense + BM25 RRF", "FastEmbed ONNX 384-dim embeddings with Reciprocal Rank Fusion.", (74, 222, 128)),
        ("Tier 4: Permanent Profile Vectors", "Indefinite Lifetime Storage", "Persistent user personas, preferences, and payment habits.", (251, 191, 36)),
    ]
    for i, (title, tag, desc, col) in enumerate(cards):
        y = 270 + i * 155
        draw.rounded_rectangle([140, y, 1780, y + 130], radius=16, fill=(13, 16, 24), outline=(35, 42, 60), width=1)
        draw.text((180, y + 24), title, fill=(255, 255, 255), font=font_h3)
        draw.text((880, y + 28), f"● {tag}", fill=col, font=font_mono)
        draw.text((180, y + 74), desc, fill=(150, 155, 175), font=font_body)

def render_scene_6(draw, t, dur):
    # Outro & CTA
    draw_badge(draw, 140, 140, "DEVELOPER-FIRST ONBOARDING", (74, 222, 128))
    draw.text((140, 180), "Deploy in Sixty Seconds.", fill=(255, 255, 255), font=font_title)
    draw.text((140, 260), "500,000 Vectors Free Forever. Zero Credit Card Required.", fill=(150, 155, 175), font=font_h2)

    # Terminal Command Box
    draw.rounded_rectangle([140, 370, 1200, 470], radius=16, fill=(10, 12, 18), outline=(56, 189, 248), width=2)
    draw.text((180, 405), "$ pip install iceberg-db", fill=(56, 189, 248), font=font_mono_lg)

    # Big CTA Card
    draw.rounded_rectangle([140, 520, 1780, 840], radius=20, fill=(15, 23, 42), outline=(37, 99, 235), width=2)
    draw.text((200, 580), "Ready to build sub-5ms AI products in India?", fill=(255, 255, 255), font=font_title)
    draw.text((200, 670), "Website: https://icebergdb.io   |   Docs: docs.icebergdb.io", fill=(96, 165, 250), font=font_mono_lg)
    draw.text((200, 740), "Supported SDKs: Python • TypeScript • Rust • Go • LangChain • LlamaIndex", fill=(148, 163, 184), font=font_body)

def draw_badge(draw, x, y, text, color):
    draw.rounded_rectangle([x, y, x + len(text) * 11 + 28, y + 32], radius=16, fill=(15, 20, 30), outline=color, width=1)
    draw.text((x + 14, y + 7), f"●  {text}", fill=color, font=font_badge)

# ── 4. Main Video Compiler ──
async def build_complete_video():
    # Step 1: Voiceovers
    wav_files = await generate_voiceovers()
    
    # Step 2: Soundtrack
    audio_path = create_soundtrack(wav_files)
    
    # Step 3: Video Rendering Pipe into FFmpeg
    print("[3/4] Rendering 1080p 60fps Motion Graphics Frames into FFmpeg...")
    total_duration = sum(sc["duration_sec"] for sc in SCENE_CONFIGS)
    total_frames = int(total_duration * FPS)
    
    cmd = [
        FFMPEG_EXE,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",               # Stdin video stream
        "-i", audio_path,        # Master audio soundtrack
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        FINAL_OUTPUT
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    scene_start_frames = []
    accum = 0
    for sc in SCENE_CONFIGS:
        scene_start_frames.append(accum)
        accum += int(sc["duration_sec"] * FPS)
    scene_start_frames.append(accum)

    img = Image.new("RGB", (WIDTH, HEIGHT), (8, 9, 13))
    draw = ImageDraw.Draw(img)

    for f in range(total_frames):
        if f % 120 == 0:
            pct = int((f / total_frames) * 100)
            print(f"  Rendering frame {f}/{total_frames} ({pct}%)...")

        # Determine current scene
        cur_sc_idx = 0
        for i in range(len(SCENE_CONFIGS)):
            if f >= scene_start_frames[i]:
                cur_sc_idx = i

        sc_info = SCENE_CONFIGS[cur_sc_idx]
        local_frame = f - scene_start_frames[cur_sc_idx]
        t = local_frame / FPS
        dur = sc_info["duration_sec"]

        draw_base_background(draw, f)

        if cur_sc_idx == 0:
            render_scene_1(draw, t, dur)
        elif cur_sc_idx == 1:
            render_scene_2(draw, t, dur)
        elif cur_sc_idx == 2:
            render_scene_3(draw, t, dur)
        elif cur_sc_idx == 3:
            render_scene_4(draw, t, dur)
        elif cur_sc_idx == 4:
            render_scene_5(draw, t, dur)
        elif cur_sc_idx == 5:
            render_scene_6(draw, t, dur)

        # Write raw bytes directly to ffmpeg pipe
        proc.stdin.write(img.tobytes())

    proc.stdin.close()
    proc.wait()
    
    file_size_mb = os.path.getsize(FINAL_OUTPUT) / (1024 * 1024)
    print(f"\n[4/4] SUCCESS! Broadcast-Quality SaaS Product Video Created:")
    print(f"  File: {FINAL_OUTPUT}")
    print(f"  Resolution: 1920x1080 Full HD @ 30 FPS")
    print(f"  Duration: {total_duration:.1f} seconds")
    print(f"  Size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    asyncio.run(build_complete_video())
