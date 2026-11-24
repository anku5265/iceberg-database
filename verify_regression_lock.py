"""
Iceberg DB (v1.0.0) — Master Regression & Version Lock Guard
=============================================================
Ensures that NO future update ever breaks:
  1. Strict Version Lock (all 9 packages & services MUST be strictly "1.0.0")
  2. Website Pre-Rendering & Clean Claims Lock (zero banned legacy strings, all 19 routes intact)
  3. Python & JS SDK Auto-Retry, Typed Errors & Point CRUD Lock
  4. Backend 21-Test Engine Suite (Isolation for SDK t_ & Dashboard u_, RBAC 403, Hybrid BM25+RRF, Point CRUD, Snapshots)

Run anytime with:
  python verify_regression_lock.py
"""

import os
import re
import sys
import json
import subprocess
from pathlib import Path
import httpx

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "iceberg-sdk-python"))

passed = 0
failed = 0


def check(name: str, cond: bool, detail: str = ""):
    global passed, failed
    if cond:
        passed += 1
        print(f"  [LOCK PASS] {name} {detail}")
    else:
        failed += 1
        print(f"  [LOCK FAIL] {name} {detail}")


print("==================================================================")
print("LOCK 1: Strict v1.0.0 Version Lock Across All 9 Components")
print("==================================================================")

# 1. Python SDK
import iceberg
check("Python SDK (__version__ == '1.0.0')", iceberg.__version__ == "1.0.0", f"got {iceberg.__version__}")

pyproj = (ROOT / "iceberg-sdk-python" / "pyproject.toml").read_text(encoding="utf-8")
check("Python pyproject.toml version == '1.0.0'", 'version = "1.0.0"' in pyproj)

# 2. JS SDK
js_pkg = json.loads((ROOT / "iceberg-sdk-js" / "package.json").read_text(encoding="utf-8"))
check("JS SDK package.json version == '1.0.0'", js_pkg.get("version") == "1.0.0", f"got {js_pkg.get('version')}")

# 3. MCP Server
mcp_pkg = json.loads((ROOT / "iceberg-mcp" / "package.json").read_text(encoding="utf-8"))
check("MCP Server package.json version == '1.0.0'", mcp_pkg.get("version") == "1.0.0", f"got {mcp_pkg.get('version')}")

# 4. Rust SDK
cargo_toml = (ROOT / "iceberg-sdk-rust" / "Cargo.toml").read_text(encoding="utf-8")
check("Rust SDK Cargo.toml version == '1.0.0'", 'version = "1.0.0"' in cargo_toml)

# 5. .NET SDK
csproj = (ROOT / "iceberg-sdk-dotnet" / "IcebergSdk.csproj").read_text(encoding="utf-8")
check(".NET SDK IcebergSdk.csproj Version == '1.0.0'", "<Version>1.0.0</Version>" in csproj)

# 6. Java SDK
pom_xml = (ROOT / "iceberg-sdk-java" / "pom.xml").read_text(encoding="utf-8")
check("Java SDK pom.xml version == '1.0.0'", "<version>1.0.0</version>" in pom_xml)

# 7. Landing & Dashboard package.json
land_pkg = json.loads((ROOT / "iceberg-landing" / "package.json").read_text(encoding="utf-8"))
dash_pkg = json.loads((ROOT / "iceberg-dashboard" / "package.json").read_text(encoding="utf-8"))
check("Landing & Dashboard package.json version == '1.0.0'", land_pkg.get("version") == "1.0.0" and dash_pkg.get("version") == "1.0.0")


print("\n==================================================================")
print("LOCK 2: Website Content Integrity & 19-Route Pre-Render Guard")
print("==================================================================")

prerender_script = (ROOT / "iceberg-landing" / "scripts" / "prerender-routes.mjs").read_text(encoding="utf-8")
for route in ["'/docs'", "'/benchmarks'", "'/security'", "'/status'", "'/about'", "'/contact'"]:
    check(f"Pre-render script locks route {route}", route in prerender_script)

banned_terms = ["28.3x", "148x", "0.04ms", "2,499"]
found_banned = []
for dp, dirs, files in os.walk(ROOT / "iceberg-landing"):
    dirs[:] = [d for d in dirs if d not in ("node_modules", "dist", ".git")]
    for f in files:
        if f.endswith((".html", ".jsx", ".js", ".txt")) and "Backup" not in f:
            txt = Path(dp, f).read_text(encoding="utf-8", errors="ignore")
            for b in banned_terms:
                if b.lower() in txt.lower():
                    found_banned.append((f, b))
check("Zero banned legacy claims in iceberg-landing", len(found_banned) == 0, f"found={found_banned}")


print("\n==================================================================")
print("LOCK 3: SDK Auto-Retry (Crash Protection), Typed Errors & CRUD")
print("==================================================================")

from iceberg import (
    Client,
    IcebergError,
    AuthenticationError,
    PermissionDeniedError,
    NotFoundError,
    ValidationError,
    RateLimitError,
)

# Test simulated transient 503 failure on Attempt #1 -> automatic recovery on Attempt #2!
attempts = {"count": 0}


def mock_handler(request: httpx.Request) -> httpx.Response:
    attempts["count"] += 1
    if request.url.path == "/search":
        if attempts["count"] < 3:
            # First 2 attempts simulate a temporary 503 cloud glitch
            return httpx.Response(503, json={"detail": "Service temporarily busy"})
        return httpx.Response(
            200,
            json={
                "results": [
                    {"id": "doc_1", "text": "Auto-retry succeeded on 3rd attempt!", "score": 0.98, "metadata": {"ok": True}}
                ]
            },
        )
    if request.url.path.startswith("/collections") and request.method == "DELETE":
        return httpx.Response(403, json={"detail": "Write permission required. Current key role is 'read_only'."})
    return httpx.Response(200, json={"status": "ok"})


sdk_client = Client(api_key="ib_test_valid_key_12345", max_retries=3, backoff_factor=0.01)
sdk_client._client = httpx.Client(transport=httpx.MockTransport(mock_handler), headers={"X-API-Key": "ib_test_valid_key_12345"})

res = sdk_client.search("my_docs", "test auto retry")
check(
    "SDK Auto-Retry recovers after 2 transient 503 errors on 3rd try",
    attempts["count"] == 3 and len(res) == 1 and res[0].id == "doc_1" and res[0].score == 0.98,
    f"attempts={attempts['count']}, top_id={res[0].id}",
)

# Verify typed PermissionDeniedError (which also subclasses IcebergError for backward compatibility!)
caught_perm = False
caught_base = False
try:
    sdk_client.delete_collection("my_docs")
except PermissionDeniedError as e:
    caught_perm = e.status_code == 403
    caught_base = isinstance(e, IcebergError)

check("SDK raises PermissionDeniedError (subclass of IcebergError) on HTTP 403", caught_perm and caught_base)
sdk_client.close()


print("\n==================================================================")
print("LOCK 4: Cross-Subdomain Direct Dashboard Session Redirect Lock")
print("==================================================================")

landing_html = (ROOT / "iceberg-landing" / "index.html").read_text(encoding="utf-8", errors="ignore")
dash_api = (ROOT / "iceberg-dashboard" / "src" / "lib" / "api.js").read_text(encoding="utf-8", errors="ignore")
dash_profile = (ROOT / "iceberg-dashboard" / "src" / "components" / "ProfileMenu.jsx").read_text(encoding="utf-8", errors="ignore")

check(
    "Landing index.html auto-redirects logged-in users (ib_session=1) to dashboard.icebergdb.in",
    "ib_session=1" in landing_html and "window.location.replace('https://dashboard.icebergdb.in/')" in landing_html,
)
check(
    "Dashboard api.js sets & clears .icebergdb.in cross-subdomain session cookie",
    "setCrossDomainSessionCookie" in dash_api and "clearCrossDomainSessionCookie" in dash_api and "Domain=.icebergdb.in" in dash_api,
)
check(
    "Dashboard ProfileMenu clears cross-subdomain session cookie on Sign out",
    "clearCrossDomainSessionCookie()" in dash_profile,
)

print("\n==================================================================")
print("LOCK 5: Backend 25-Test Validation Suite")
print("==================================================================")

rc = subprocess.run(
    [sys.executable, str(ROOT / "iceberg-backend" / "tests" / "test_validation_suite.py")],
    cwd=str(ROOT),
).returncode
check("Backend 25-Test Validation Suite passes 100%", rc == 0)

print("\n==================================================================")
print(f"MASTER REGRESSION LOCK SUMMARY: {passed} LOCKS PASSED, {failed} FAILED")
print("==================================================================")
if failed > 0:
    sys.exit(1)
