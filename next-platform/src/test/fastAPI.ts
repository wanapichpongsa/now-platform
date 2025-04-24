"use server";

async function GET(): Promise<Response> {
  console.log("fetching");
  const response = await fetch(`http://127.0.0.1:8000/pdfparser/${encodeURIComponent(process.env.PDF_PATH!)}`);
  const data = await response.json();

  const formattedContent = data.parsed_content.replace(/\\n/g, '\n');
  console.log(formattedContent);

  return formattedContent
}

(async () => {const response = await GET()})();