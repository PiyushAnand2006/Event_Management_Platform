#!/bin/bash

# Redirect stderr to stdout to avoid execute_command failing due to stderr output
exec 2>&1

set -e

# Get the directory where the script is located (.zscripts directory, i.e. workspace-agent/.zscripts)
# Use $0 to get the script path (compatible with sh and bash)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Next.js project path
NEXTJS_PROJECT_DIR="/home/z/my-project"

# Check if the Next.js project directory exists
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Error: Next.js project directory does not exist: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Starting build of Next.js app and mini-services..."
echo "📁 Next.js project path: $NEXTJS_PROJECT_DIR"

# Switch to the Next.js project directory (frontend subdirectory)
cd "$NEXTJS_PROJECT_DIR/frontend" || exit 1

# Set environment variables
export NEXT_TELEMETRY_DISABLED=1

BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
echo "📁 Cleaning and creating build directory: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build the Next.js app
echo "🔨 Building Next.js app..."
bun run build

# Verify that the standalone server entry is generated (deployment success guard).
# Next only produces .next/standalone/server.js when next.config contains output:"standalone".
# If the user/AI edits the project and modifies or removes this config, bun run build will
# still succeed (static output is produced, exit code 0), but standalone will be missing —
# the package won't have server.js, and after deployment to FC, start.sh won't find
# next-service-dist/server.js → Next won't start → Caddy:81 reverse proxy to empty port 3000
# → FC health check times out after 120s (main cause of online warmup_412 / FunctionNotStarted).
# Here we do a self-heal: only when it's actually missing, add output:"standalone" back to
# next.config and rebuild. Normal projects (server.js already generated) skip this entire
# section without reading or writing any user files.
if [ ! -f ".next/standalone/server.js" ]; then
    echo "⚠️  Build did not produce .next/standalone/server.js, starting self-heal of next.config output configuration..."
    NEXT_CONFIG_FILE="$(ls next.config.ts next.config.js next.config.mjs next.config.cjs 2>/dev/null | head -1)"

    if [ -z "$NEXT_CONFIG_FILE" ]; then
        echo "❌ Build failed: next.config.* not found, cannot generate standalone deployment artifacts."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        # standalone is declared but server.js still wasn't produced, meaning it's not a config
        # issue (possibly a real build error, custom distDir, etc.). Don't modify user config,
        # fail directly and expose the reason.
        echo "❌ Build failed: $NEXT_CONFIG_FILE already contains output:\"standalone\", but .next/standalone/server.js was still not generated."
        echo "   Please check the errors in the build log above or the project's custom build configuration."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]" "$NEXT_CONFIG_FILE"; then
        # Another output is explicitly declared (e.g. "export" static export / any value other than "standalone").
        # "export" is mutually exclusive with this deployment model (standalone + custom server) —
        # a second output cannot be injected to override user intent (duplicate keys in JS objects
        # mean the latter wins, so injection would be ineffective). Fail explicitly.
        echo "❌ Build failed: $NEXT_CONFIG_FILE declares a non-standalone output (e.g. \"export\" static export), incompatible with the current deployment model."
        echo "   Current deployment requires output:\"standalone\". Please change to standalone, or confirm whether this project should use static hosting instead of the deployment sandbox."
        exit 1
    fi

    echo "🔧 Detected that $NEXT_CONFIG_FILE is missing output:\"standalone\", auto-injecting and rebuilding..."
    cp "$NEXT_CONFIG_FILE" "${NEXT_CONFIG_FILE}.zbak"
    # Insert output:"standalone" after the opening { of the first config object literal,
    # covering common scaffold patterns: const nextConfig...= {  /  export default {  /  module.exports = {
    perl -0pi -e 's/((?:const\s+\w+[^=]*=|export\s+default|module\.exports\s*=)\s*\{)/$1\n  output: "standalone",/' "$NEXT_CONFIG_FILE"

    if ! grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ Could not match an injectable config object. next.config syntax is unconventional; output:\"standalone\" must be added manually."
        echo "   Current $NEXT_CONFIG_FILE content:"
        cat "$NEXT_CONFIG_FILE"
        mv "${NEXT_CONFIG_FILE}.zbak" "$NEXT_CONFIG_FILE"
        exit 1
    fi

    echo "🔨 Injected output:\"standalone\", rebuilding..."
    bun run build

    if [ ! -f ".next/standalone/server.js" ]; then
        echo "❌ After injecting output:\"standalone\" and rebuilding, .next/standalone/server.js was still not generated."
        exit 1
    fi
    echo "✅ Self-heal successful: standalone server entry has been generated."
fi

# Build mini-services
# Check if the Next.js project directory has a backend directory (formerly mini-services)
if [ -d "$NEXTJS_PROJECT_DIR/backend" ]; then
    echo "🔨 Building mini-services..."
    # Use the mini-services scripts from the workspace-agent directory
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    # Copy mini-services-start.sh to the mini-services-dist directory
    echo "  - Copying mini-services-start.sh to $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  backend directory does not exist, skipping"
fi

# Copy all build artifacts to the temporary build directory
echo "📦 Collecting build artifacts to $BUILD_DIR..."

# Copy Next.js standalone build output
if [ -d ".next/standalone" ]; then
    echo "  - Copying .next/standalone"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
fi

# Copy Next.js static files
if [ -d ".next/static" ]; then
    echo "  - Copying .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

# Copy public directory
if [ -d "public" ]; then
    echo "  - Copying public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Python does not inherit workspace-agent's /home/z/.venv. If the project contains Python
# source code or a dependency manifest, solidify production dependencies into the artifact
# during the build, and preserve the project-relative paths of Python source code.
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/python-runtime-build.sh"

# Copy existing data when a Preview database is present; otherwise initialize an empty
# database directly in the deployment artifact. Template source does not carry db/custom.db,
# so dev.sh must not be required to have run successfully before Deploy.
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

# Copy Caddyfile (if it exists)
if [ -f "$NEXTJS_PROJECT_DIR/Caddyfile" ]; then
    echo "  - Copying Caddyfile"
    cp "$NEXTJS_PROJECT_DIR/Caddyfile" "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile does not exist, skipping"
fi

# Copy start.sh script
echo "  - Copying start.sh to $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Package to $BUILD_DIR.tar.gz
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Packaging build artifacts to $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

# # Clean up temporary directory
# rm -rf "$BUILD_DIR"

echo ""
echo "✅ Build complete! All artifacts packaged to $PACKAGE_FILE"
echo "📊 Package file size:"
ls -lh "$PACKAGE_FILE"
