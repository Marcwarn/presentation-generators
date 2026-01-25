// File parsing utilities for various document types

export async function parseFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Text files
  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return new TextDecoder().decode(buffer);
  }

  // PDF files
  if (fileName.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  }

  // Word documents
  if (fileName.endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // PowerPoint files - extract text
  if (fileName.endsWith('.pptx')) {
    // Basic text extraction from PPTX
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    let text = '';

    const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));

    for (const slideFile of slideFiles.sort()) {
      const content = await zip.files[slideFile].async('string');
      // Extract text between <a:t> tags
      const matches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
      const slideText = matches.map(m => m.replace(/<\/?a:t>/g, '')).join(' ');
      if (slideText.trim()) {
        text += slideText + '\n\n';
      }
    }

    return text || 'Could not extract text from PowerPoint file';
  }

  throw new Error(`Unsupported file type: ${fileName}`);
}

export async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const html = await response.text();
      // Basic HTML to text conversion
      return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (contentType.includes('text/plain')) {
      return await response.text();
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getSupportedFileTypes(): string[] {
  return ['.txt', '.md', '.pdf', '.docx', '.pptx'];
}

export function getAcceptString(): string {
  return '.txt,.md,.pdf,.docx,.pptx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation';
}
