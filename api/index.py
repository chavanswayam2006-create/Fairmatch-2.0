import sys
import os

# Add backend directory and parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(parent_dir, "backend")

for p in [backend_dir, parent_dir]:
    if p not in sys.path and os.path.exists(p):
        sys.path.insert(0, p)

try:
    from app.main import app
except ImportError:
    from backend.app.main import app  # type: ignore
