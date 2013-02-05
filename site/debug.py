import sys

sys.path.append("..\\site-packages\\")

from tornado.ioloop import IOLoop
from notepanel import app

app.listen(5000)

IOLoop.instance().start()

