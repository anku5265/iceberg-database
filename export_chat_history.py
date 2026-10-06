import json
import os
import re
import sys

TRANSCRIPT_PATH = r"C:\Users\Acer\.gemini\antigravity\brain\01a614b2-77e3-4196-afcb-3f3f4f4c6ce8\.system_generated\logs\transcript_full.jsonl"
OUTPUT_PATH = r"d:\icebergdb\FULL_CONVERSATION_CHAT_HISTORY.md"

def sanitize(text: str) -> str:
    # Mask API tokens so GitHub Push Protection doesn't block git commits
    text = re.sub(r'pypi-[A-Za-z0-9_\-]+', '[PYPI_TOKEN_MASKED]', text)
    text = re.sub(r'vcp_[A-Za-z0-9_\-]+', '[VERCEL_TOKEN_MASKED]', text)
    text = re.sub(r'ghp_[A-Za-z0-9_\-]+', '[GITHUB_TOKEN_MASKED]', text)
    text = re.sub(r'eyJhbGciOi[A-Za-z0-9_\-\.]+', '[JWT_TOKEN_MASKED]', text)
    return text

def export_history():
    if not os.path.exists(TRANSCRIPT_PATH):
        print(f"Error: {TRANSCRIPT_PATH} not found.")
        sys.exit(1)

    print("Parsing full conversation transcript...")
    entries = []
    
    with open(TRANSCRIPT_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
            except Exception:
                continue

            stype = data.get("type")
            source = data.get("source")
            created = data.get("created_at", "")[:19].replace("T", " ")

            if stype == "USER_INPUT" and source == "USER_EXPLICIT":
                content = data.get("content", "").strip()
                if content:
                    entries.append({
                        "role": "Ankush",
                        "time": created,
                        "text": sanitize(content)
                    })
            elif stype == "PLANNER_RESPONSE" and source == "MODEL":
                content = data.get("content", "").strip()
                if content:
                    sanitized_content = sanitize(content)
                    if entries and entries[-1]["role"] == "Antigravity (AI)":
                        entries[-1]["text"] += "\n\n" + sanitized_content
                    else:
                        entries.append({
                            "role": "Antigravity (AI)",
                            "time": created,
                            "text": sanitized_content
                        })

    print(f"Extracted {len(entries)} dialogue blocks.")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as out:
        out.write("# 📜 COMPLETE CONVERSATION & CHAT HISTORY ARCHIVE (START TO PRESENT)\n\n")
        out.write("> **Permanent Raw Chat Record between Ankush & Antigravity (AI)**  \n")
        out.write("> Preserved in the repository for full continuity across all future AI models, sessions, and platforms.  \n\n")
        out.write("---\n\n")

        for idx, e in enumerate(entries, 1):
            role = e["role"]
            time_str = e["time"]
            text = e["text"]
            if role == "Ankush":
                out.write(f"### 👤 Turn {idx} | Ankush ({time_str})\n\n")
                out.write(f"**Message:**\n```text\n{text}\n```\n\n")
            else:
                out.write(f"### 🤖 Turn {idx} | Antigravity AI ({time_str})\n\n")
                out.write(f"{text}\n\n")
            out.write("---\n\n")

    size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"Successfully generated {OUTPUT_PATH} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    export_history()
