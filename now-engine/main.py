from fastapi import FastAPI, UploadFile, File
# from urllib.parse import unquote
import logging
import pdfplumber
from io import BytesIO

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_pdf_pages(path: str) -> list:
    pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text())
    return pages

app = FastAPI()
@app.get("/")
def read_root():
  return {"Hello from now-engine"}

# How access multipart/form-data body?
# API Doesn't work. Will be using SimpleHTTPServer in the meantime
# multipart/form-data worked for SimpleHTTPServer, but fastapi abstraction confuses me
@app.post("/pdfparser/")
async def parse_pdf(body: UploadFile = File(...)):
    print("body: " + body)
    contents = await body.read()
    print("contents: " + contents)
    with pdfplumber.open(BytesIO(contents)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        print(text)
    return {"parsed_content": text}

"""
{
"item_id": 1,
"q": null
}
"""