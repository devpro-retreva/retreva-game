#!/usr/bin/env bash
# Installs headless Blender (the `bpy` module from PyPI) into a venv for the asset scripts in this folder.
# Idempotent: does nothing when the right version is already there. Development only — the game never needs it.
#   BLENDER_PY_ENV  venv location (default /opt/blender-py)
set -euo pipefail
ENV_DIR="${BLENDER_PY_ENV:-/opt/blender-py}"
BPY_VERSION="5.2.2" # Blender 5.2 LTS; bpy 5.2 wheels need Python 3.13

if [ -x "$ENV_DIR/bin/python" ] && "$ENV_DIR/bin/python" -c "import bpy, sys; sys.exit(bpy.app.version_string.split()[0] != '$BPY_VERSION')" 2>/dev/null; then
  echo "bpy $BPY_VERSION already installed in $ENV_DIR"
  exit 0
fi

if command -v uv >/dev/null 2>&1; then
  uv venv "$ENV_DIR" --python 3.13 --allow-existing
  VIRTUAL_ENV="$ENV_DIR" uv pip install "bpy==$BPY_VERSION"
else
  python3.13 -m venv "$ENV_DIR"
  "$ENV_DIR/bin/pip" install "bpy==$BPY_VERSION"
fi
"$ENV_DIR/bin/python" -c "import bpy; print('Blender', bpy.app.version_string, 'ready in $ENV_DIR')"
