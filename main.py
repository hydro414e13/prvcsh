from app import app
from routes import *

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3002, debug=True)
