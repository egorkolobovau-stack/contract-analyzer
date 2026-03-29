export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const name = fileName.toLowerCase();

  try {
    if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
      // Dynamic import to avoid webpack issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (mimeType === 'text/plain' || name.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    return '';
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error);
    return '';
  }
}
