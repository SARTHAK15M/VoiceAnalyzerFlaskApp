import sys
import os

# Add your project directory to the sys.path
# This tells Python where to find your 'app.py' module
project_home = u'/SarthakMadaan/VoiceAnalyzerWebProject' # <<< IMPORTANT: CHANGE 'your_username'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import your Flask app instance named 'app' from 'app.py'
from app import app as application