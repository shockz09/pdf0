#!/bin/bash
set -e

# Configuration
BINARY_NAME="noupload"
INSTALL_DIR="/usr/local/bin"

# Detect OS and Arch
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

# Map architecture names
if [ "$ARCH" == "x86_64" ]; then
  ARCH="x64"
elif [ "$ARCH" == "aarch64" ] || [ "$ARCH" == "arm64" ]; then
  ARCH="arm64"
else
  echo "❌ Unsupported architecture: $ARCH"
  exit 1
fi

# Construct asset name (e.g., noupload-linux-x64)
ASSET_NAME="${BINARY_NAME}-${OS}-${ARCH}"
if [ "$OS" == "windows" ]; then
  ASSET_NAME="${ASSET_NAME}.exe"
fi

echo "⬇️  Installing ${BINARY_NAME} for ${OS}/${ARCH}..."

# Find latest release URL
LATEST_URL="https://noupload.xyz/releases/${ASSET_NAME}"

# Setup install directory
if [ ! -d "$INSTALL_DIR" ]; then
  # Fallback to local bin if /usr/local/bin fails or doesn't exist
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
  
  # Add to PATH if not present
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.bashrc"
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.zshrc"
  fi
fi

# Download
TEMP_FILE="/tmp/${BINARY_NAME}"
if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$LATEST_URL" -o "$TEMP_FILE"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$TEMP_FILE" "$LATEST_URL"
else
  echo "❌ Error: Need curl or wget to download."
  exit 1
fi

# Install
chmod +x "$TEMP_FILE"
echo "📦 Moving to $INSTALL_DIR..."

if [ -w "$INSTALL_DIR" ]; then
  mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
else
  sudo mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
fi

echo "✅ Installed successfully!"
echo "Run 'noupload setup' to install system dependencies."
