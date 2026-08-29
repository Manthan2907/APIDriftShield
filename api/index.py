import sys
import os

# Add antigravity_backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "antigravity_backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from main import app
