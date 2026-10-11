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
OUT_DIR = r"d:\icebergdb"
AUDIO_DIR = os.path.join(OUT_DIR, "video_assets")
os.makedirs(AUDIO_DIR, exist_ok=True)

# 1. Voiceover Script & Scene Breakdown
SCENES = [
    {
        "id": "scene1_problem",
        "text": "In the era of real-time AI and autonomous agents, traditional vector databases are broken. Crippling cross-border latency, unpredictable cold starts, and data residency compliance risks.",
        "title": "THE PROBLEM",
        "subtitle": "Traditional vector infrastructure wasn't built for low-latency AI",
    },
    {
        "id": "scene2_reveal",
        "text": "Introducing Iceberg. The serverless vector database engineered from the ground up for extreme speed, scale, and compliance.",
        "title": "ICEBERG DATABASE",
        "subtitle": "Serverless Vector Engine for Real-Time AI",
    },
    {
        "id": "scene3_rust_engine",
        "text": "Built in Rust with native SIMD AVX-512 acceleration, Iceberg executes memory-mapped HNSW graph search with zero cold starts and instant query execution.",
        "title": "CORE ARCHITECTURE",
        "subtitle": "Rust Engine • SIMD AVX-512 • Zero Cold Starts",
    },
    {
        "id": "scene4_benchmark",
        "text": "Colocated in Mumbai IDC-2, Iceberg delivers sub-5ms p99 latency. Over fifty times faster than US-hosted databases, with one hundred percent data sovereignty under the DPDP Act.",
        "title": "HARDWARE BENCHMARK",
        "subtitle": "58x Lower Latency • 100% Indian Data Sovereignty",
    },
    {
        "id": "scene5_memory",
        "text": "Equip your AI agents with 4-tier persistent memory, hybrid dense plus BM25 keyword search, and native SDKs for Python, Rust, and TypeScript.",
        "title": "AUTONOMOUS MEMORY",
        "subtitle": "4-Tier Persistent Context • Hybrid RRF Search",
    },
    {
        "id": "scene6_outro",
        "text": "Deploy your first vector cluster in sixty seconds. Index 500,000 vectors completely free. Visit icebergdb.io today.",
        "title": "START BUILDING FREE",
        "subtitle": "pip install iceberg-db • icebergdb.io",
    }
]

print("Script template defined with 6 scenes.")
