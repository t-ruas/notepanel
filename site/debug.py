import sys
from os import path

packages_path = path.join("..", "site-packages")
sys.path.append(packages_path)

from notepanel import app

app.debug = True
app.run()
