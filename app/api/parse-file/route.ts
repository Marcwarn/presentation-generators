import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    if (!file && !url) {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 }
      );
    }

    let text = '';

    if (file) {
      const fileName = file.name.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Text files
      if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        text = new TextDecoder().decode(buffer);
      }
      // PDF files
      else if (fileName.endsWith('.pdf')) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        text = data.text;
      }
      // Word documents
      else if (fileName.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      }
      // PowerPoint files
      else if (fileName.endsWith('.pptx')) {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(buffer);

        const slideFiles = Object.keys(zip.files)
          .filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'))
          .sort();

        for (const slideFile of slideFiles) {
          const content = await zip.files[slideFile].async('string');
          const matches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
          const slideText = matches.map(m => m.replace(/<\/?a:t>/g, '')).join(' ');
          if (slideText.trim()) {
            text += slideText + '\n\n';
          }
        }

        if (!text) {
          text = 'Could not extract text from PowerPoint file';
        }
      }
      else {
        return NextResponse.json(
          { error: `Unsupported file type: ${fileName}` },
          { status: 400 }
        );
      }
    }

    if (url) {
      try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/html')) {
          const html = await response.text();
          text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        } else {
          text = await response.text();
        }
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ text, length: text.length });
  } catch (error) {
    console.error("Parse file error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse file" },
      { status: 500 }
    );
  }
}
