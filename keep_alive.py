#!/usr/bin/env python3
"""
Iceberg Database — Render Backend 24/7 Keep-Alive Daemon
Pings https://iceberg-backend-hrg9.onrender.com/health every 9 minutes
to prevent Render free tier from sleeping (inactivity timeout is 15 minutes).
"""

import time
import urllib.request
from datetime import datetime

URL = "https://iceberg-backend-hrg9.onrender.com/health"
INTERVAL_SECONDS = 540  # 9 minutes

print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 Starting Iceberg Keep-Alive Daemon...")
print(f"Target: {URL}")
print(f"Interval: Every {INTERVAL_SECONDS // 60} minutes\n")

while True:
    try:
        start = time.time()
        req = urllib.request.Request(URL, headers={"User-Agent": "IcebergKeepAlive/1.0"})
        with urllib.request.urlopen(req, timeout=30) as res:
            elapsed_ms = (time.time() - start) * 1000
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{now}] ✅ PING OK | Status: {res.status} | Latency: {elapsed_ms:.1f}ms")
    except Exception as e:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] ⚠️ PING WARNING: {e}")

    time.sleep(INTERVAL_SECONDS)
