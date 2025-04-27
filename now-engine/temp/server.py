from http.server import HTTPServer, SimpleHTTPRequestHandler
import logging
import json # serialise obj to json str for Response
import os # write temporary pdf
import pdfplumber # decode pdf bytes to rightly formatted str

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


# GET && HEAD commands
class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/pdfparser/":
            try:
                # Needs format string to parse cout as string
                print(f"<<Headers>>\n{self.headers}") # STRANGE: why not body attribute?
                # baggage is sentry. What is sentry's role as a HTTP entity?
                # content-length is 92255
                
                # Get content length to parse precise io.BufferedReader length 
                content_length = int(self.headers.get('content-length', 0))
                logging.info(f"content-length: {content_length}")
                
                # content-type: multipart/form-data; boundary=----formdata-undici-076169061631
                content_type = self.headers.get('content-type', '')
                logging.info(f"content-type: {content_type}")
                if 'multipart/form-data' not in content_type:
                    self.send_error(400, "Expected multipart/form-data")
                    return
                
                logging.info("<< PROCESSING FILE >>")
                
                print(f"File: {self.rfile}")
                # File: <_io.BufferedReader name=4>
                # No explicit clue on how to access this object (byte array?)

                post_data: bytes = self.rfile.read(content_length)
                # print(f"<<Post Data>>\n{post_data}")
                # Bytes are implictly written as hex
                # Strangely has strings "...\nendstream... \nendobj\nxref\n0 34 ]n0000 && [0-9] blocks ... -+formdata-undici-{int_id}--' "
                
                # Post data is segmented by boundaries (e.g., -------formdata-undici-053426058614--), which we found at the end
                boundary: str = content_type.split('=')[1].strip()
                boundary: bytes = boundary.encode()

                parts: bytes = post_data.split(boundary)

                for part in parts:
                    # Fun fact: form-data needs to be bytes otherwise encoding error with string standardisation
                    # e.g., Windows: b'\r\n', Unix: b'\n', OldMacs: b'\n' == 0x0D0x0A == 1310
                    if b'name="file"' in part and b'filename=' in part:
                        # All this to only remove 68 characters. TODO: perhaps just check this straight from post_data
                        logging.info(f"file part length: {len(part)}")
                        file_name: str = part.split(b'filename=')[1].split(b'\r\n')[0].strip(b'"').decode()
                        # Find start of file content (after double \r\n). \r is carriage return like on a typewriter.
                        file_content: bytes = part.split(b'\r\n\r\n')[1].rsplit(b'\r\n', 1)[0]
                        
                        file_path = f'pdfs/{file_name}'
                        logging.info(f"writing {file_path}")
                        # 2025-04-25 21:29:12,355 - ERROR - Error: 'str' object cannot be interpreted as an integer
                        logging.info(f"file_content type: {type(file_content)}") # says bytes but not int?
                        with open(file_path, 'wb') as f:
                            f.write(file_content) # The error exists here. I'm sure.
                        
                        logging.info("parsing with pdfplumber...")
                        with pdfplumber.open(file_path) as pdf:
                            text = ""
                            for page in pdf.pages:
                                text += page.extract_text() + "\n"
                        
                            # don't know how to delete file yet so weary on f.write()  or f.write("")
                        
                            # Are these processes asynchronous, not on wfile?
                            self.send_response(200)

                            self.send_header('Content-Type', 'application/json')
                            self.end_headers()

                            response = {'extracted_text': text}
                            # Ah so we read request json files, write response json files
                            self.wfile.write(json.dumps(response).encode())

                            return
                # If no instance of file part
                self.send_error(400, "No file found in request")

            except Exception as e:
                logging.error(f"Error: {e}")
                self.send_error(500, str(e))
              

def run_server():
    server = HTTPServer(('127.0.0.1', 5000), RequestHandler) # : implicit
    logging.info("Server running on http://127.0.0.1:5000")

    server_address = server.server_address
    logging.info(f"Server address: {server_address}")

    server.serve_forever()


if __name__ == '__main__':
    run_server()
