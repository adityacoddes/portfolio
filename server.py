import http.server
import socketserver
import webbrowser
import threading
import time
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser():
    # Wait a moment for the server to start up
    time.sleep(1.5)
    url = f"http://localhost:{PORT}"
    print(f"\n[SERVER] Launching browser to: {url}")
    webbrowser.open(url)

def run_server():
    Handler = MyHTTPRequestHandler
    # Allow port reuse to avoid 'Address already in use' errors on quick restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n========================================================")
        print(f"  ADITYA WADEKAR PORTFOLIO LOCAL DEVELOPMENT SERVER      ")
        print(f"========================================================")
        print(f"  Serving files from: {DIRECTORY}")
        print(f"  Local Address:      http://localhost:{PORT}")
        print(f"========================================================")
        print(f"  Press Ctrl+C to stop the server.")
        print(f"========================================================\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[SERVER] Server stopped by user.")
        except Exception as e:
            print(f"\n[SERVER] Error: {str(e)}")

if __name__ == "__main__":
    # Start browser-opener in a separate thread so it doesn't block serve_forever
    threading.Thread(target=open_browser, daemon=True).start()
    run_server()
