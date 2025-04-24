from fastapi import FastAPI
from fastapi.responses import JSONResponse
from urllib.parse import unquote
import logging
import pdfplumber

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

# multipart/form-data
# : UploadFile = File(...)
@app.get("/pdfparser/{pdf_path:path}")
def read_item(pdf_path: str):
    actual_path = unquote(pdf_path)  # decodes the URL-encoded path
    pages = get_pdf_pages(actual_path)
    pages_as_text = ""
    for page in pages: 
        pages_as_text += page + "\n"
    return JSONResponse(
        content={
            "pdf_path": actual_path,
            "parsed_content": pages_as_text
        },
        media_type="application/json"
    )

"""
{
"item_id": 1,
"q": null
}
"""