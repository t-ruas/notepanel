from notepanel import app

app.run(debug=True)

import logging
from logging.handlers import RotatingFileHandler
file_handler = RotatingFileHandler(filename='.\app.log')
file_handler.setLevel(logging.WARNING)
app.logger.addHandler(file_handler)
