import sys

sys.path.append("..\\site-packages\\")

from notepanel import app

app.debug = True
app.run()
