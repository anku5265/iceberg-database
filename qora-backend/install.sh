#!/bin/bash
# Qora Self-Hosted Installer
# Usage: curl -sSL https://install.qora.in | bash
# Or with license: QORA_LICENSE=your_key curl -sSL https://install.qora.in | bash

set -e

QORA_VERSION="0.1.0"
QORA_DIR="$HOME/.qora"
REPO_URL="https://github.com/qora-db/qora/archive/refs/heads/main.tar.gz"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}  ██████╗  ██████╗ ██████╗  █████╗ ${NC}"
echo -e "${BLUE} ██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗${NC}"
echo -e "${BLUE} ██║   ██║██║   ██║██████╔╝███████║${NC}"
echo -e "${BLUE} ╚██████╔╝╚██████╔╝██║  ██║██║  ██║${NC}"
echo -e "${BLUE}  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝${NC}"
echo ""
echo -e "  Vector Database — Self-Hosted v${QORA_VERSION}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3.9+ is required${NC}"
    echo "Install: https://python.org"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION found"

# Create install directory
mkdir -p "$QORA_DIR"
cd "$QORA_DIR"

echo "→ Installing Qora..."

# Install via pip
python3 -m pip install qora-server --quiet 2>/dev/null || {
    # Fallback: install dependencies directly
    python3 -m pip install fastapi uvicorn qdrant-client fastembed pypdf httpx pydantic-settings --quiet
}

# Create config file
if [ ! -f "$QORA_DIR/.env" ]; then
    cat > "$QORA_DIR/.env" << EOF
MASTER_API_KEY=$(python3 -c "import secrets; print('qr_' + secrets.token_urlsafe(32))")
BYOC_LICENSE_KEY=${QORA_LICENSE:-""}
BYOC_MODE=true
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=qora-storage
EOF
    echo -e "${GREEN}✓${NC} Config created at $QORA_DIR/.env"
fi

# Create start script
cat > "$QORA_DIR/start.sh" << 'EOF'
#!/bin/bash
cd ~/.qora
source .env 2>/dev/null || true
export $(cat .env | grep -v '^#' | xargs)
python3 -m uvicorn qora.main:app --host 0.0.0.0 --port 8000
EOF
chmod +x "$QORA_DIR/start.sh"

# Create systemd service (Linux)
if command -v systemctl &> /dev/null; then
    sudo tee /etc/systemd/system/qora.service > /dev/null << EOF
[Unit]
Description=Qora Vector Database
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$QORA_DIR
EnvironmentFile=$QORA_DIR/.env
ExecStart=$(which python3) -m uvicorn qora.main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable qora
    sudo systemctl start qora
    echo -e "${GREEN}✓${NC} Qora service installed and started"
else
    echo -e "${GREEN}✓${NC} Run manually: bash $QORA_DIR/start.sh"
fi

# Get API key
API_KEY=$(grep MASTER_API_KEY "$QORA_DIR/.env" | cut -d= -f2)

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Qora installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  API URL    : http://localhost:8000"
echo "  API Key    : $API_KEY"
echo "  API Docs   : http://localhost:8000/docs"
echo "  Config     : $QORA_DIR/.env"
echo ""
echo "  Quick test:"
echo "  curl http://localhost:8000/health"
echo ""
