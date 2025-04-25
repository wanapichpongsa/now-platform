"use server";

// the client File could still contain data about fs path (sensitive)
export async function postPdfFormdataToText(formData: FormData): Promise<string> {
  try {
    const response = await fetch('http://127.0.0.1:5000/pdfparser/', {
      method: 'POST',
      body: formData
    });
    // I think SimpleHTTPServer returns HTML so response.json typerror
    const data = await response.json();

    if (!data.extracted_text) throw new Error("No extracted text returned");
    const formattedContent: string = data.extracted_text.replace(/\\n/g, '\n');
    console.log(formattedContent);

    return formattedContent

  } catch (error) {
    console.error(error);
    throw new Error("pdfplumber endpoint failure")
  }
}

// Example usage:
// const file = fileInput.files?.[0];
// if (file) {
//   const response = await postPdfFormdataToText(file);
//   console.log(response);
// }