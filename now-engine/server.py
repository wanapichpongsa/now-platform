from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import logging
from agent import ConversationalAgent

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_agent_response(message: str):
  agent = ConversationalAgent()
  agent.conversation(message)
  return agent.get_latest_response()

"""
Python code is so highly nested it hurts my eyes to read it!

Current Roles:


Missing Roles:
"""
class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
      if self.path == '/now-engine':
        content_length = int(self.headers.get('Content-Length', 0))
        try:
          logging.info(f'Received request with content length: {content_length}')
          if content_length == 0:
            logging.warning('Empty request body received')
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'message': 'Bad Request: Empty request body'}
            self.wfile.write(json.dumps(response).encode())
            return
          

          post_data: bytes = self.rfile.read(content_length)
          post_data = str(post_data, 'utf-8')
          logging.info(f"Raw data received: {post_data}")
          
          agent_response = get_agent_response(post_data)
          logging.info(f"Agent response: {agent_response}")

          self.send_response(200)
          self.send_header('Content-Type', 'application/json')
          self.end_headers()
          response = {'message': agent_response} # will be the agent response
          self.wfile.write(json.dumps(response).encode())
        except Exception as e:
          logging.error(e)
          self.send_response(500)
          self.send_header('Content-Type', 'application/json')
          self.end_headers()
          response = {'message': f'error: {e}'}
          self.wfile.write(json.dumps(response).encode())
      else:
        return self.send_response(404)


def run_server():
  server = HTTPServer(('127.0.0.1', 8080), RequestHandler)
  print("Server running on http://127.0.0.1:8080")
  server.serve_forever()

if __name__ == "__main__":
  run_server()