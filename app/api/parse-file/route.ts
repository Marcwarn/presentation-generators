import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime for file parsing compatibility
export const runtime = 'nodejs';

// Custom PDF text extraction that works in Node.js/Vercel without browser APIs
// This avoids the DOMMatrix/Canvas issues with pdf-parse/pdfjs-dist
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
      const textParts: string[] = [];
      const content = buffer.toString('binary');

  // Find all stream objects in the PDF
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match;

  while ((match = streamRegex.exec(content)) !== null) {
          const streamContent = match[1];

        // Try to decompress if it's a FlateDecode stream
        let decompressed = streamContent;
          try {
                    const zlib = require('zlib');
                    const buf = Buffer.from(streamContent, 'binary');
                    decompressed = zlib.inflateSync(buf).toString('utf-8');
          } catch {
                    // Not compressed or different compression, use raw content
            decompressed = streamContent;
          }

        // Extract text from text showing operators (Tj, TJ, ')
        // BT ... ET blocks contain text operations
        const btBlocks = decompressed.match(/BT[\s\S]*?ET/g) || [];

        for (const block of btBlocks) {
                  // Match text in parentheses with Tj operator: (text) Tj
            const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || [];
                  for (const tj of tjMatches) {
                              const textMatch = tj.match(/\(([^)]*)\)/);
                              if (textMatch) {
                                            textParts.push(decodeEscapedPDFText(textMatch[1]));
                              }
                  }

            // Match TJ arrays: [(text) num (text) num ...] TJ
            const tjArrayMatches = block.match(/\[([^\]]*)\]\s*TJ/gi) || [];
                  for (const tjArr of tjArrayMatches) {
                              const innerMatch = tjArr.match(/\[([^\]]*)\]/);
                              if (innerMatch) {
                                            const parts = innerMatch[1].match(/\(([^)]*)\)/g) || [];
                                            const text = parts.map(p => {
                                                            const m = p.match(/\(([^)]*)\)/);
                                                            return m ? decodeEscapedPDFText(m[1]) : '';
                                            }).join('');
                                            if (text.trim()) textParts.push(text);
                              }
                  }

            // Match single-quote text operator: (text) '
            const quoteMatches = block.match(/\(([^)]*)\)\s*'/g) || [];
                  for (const q of quoteMatches) {
                              const textMatch = q.match(/\(([^)]*)\)/);
                              if (textMatch) {
                                            textParts.push(decodeEscapedPDFText(textMatch[1]));
                              }
                  }
        }
  }

  // Also look for text outside streams (uncompressed PDFs)
  const directTextMatches = content.match(/\(([^)]{2,})\)\s*Tj/g) || [];
      for (const dt of directTextMatches) {
              const textMatch = dt.match(/\(([^)]*)\)/);
              if (textMatch) {
                        const decoded = decodeEscapedPDFText(textMatch[1]);
                        if (decoded.trim() && !textParts.includes(decoded)) {
                                    textParts.push(decoded);
                        }
              }
      }

  let result = textParts.join(' ').replace(/\s+/g, ' ').trim();

  // If custom extraction yielded poor results, fall back to pdf-parse with polyfills
  if (!result || result.length < 50 || hasGarbageText(result)) {
          result = await fallbackPdfParse(buffer);
  }

  return result;
}

function decodeEscapedPDFText(text: string): string {
      return text
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function hasGarbageText(text: string): boolean {
      // Check if text has too many replacement characters or non-printable chars
  const garbageChars = (text.match(/[\uFFFD\u0000-\u0008\u000E-\u001F]/g) || []).length;
      return garbageChars > text.length * 0.1; // More than 10% garbage
}

async function fallbackPdfParse(buffer: Buffer): Promise<string> {
      // Polyfill DOMMatrix and Path2D for pdf-parse compatibility
  if (typeof globalThis.DOMMatrix === 'undefined') {
          (globalThis as any).DOMMatrix = class DOMMatrix {
                    a=1;b=0;c=0;d=1;e=0;f=0;
                    m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
                    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
                    is2D=true;isIdentity=true;
                    constructor(_init?: any) {}
                    inverse() { return new DOMMatrix(); }
                    multiply() { return new DOMMatrix(); }
                    translate() { return new DOMMatrix(); }
                    scale() { return new DOMMatrix(); }
                    rotate() { return new DOMMatrix(); }
                    flipX() { return new DOMMatrix(); }
                    flipY() { return new DOMMatrix(); }
                    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
                    toFloat32Array() { return new Float32Array(16); }
                    toFloat64Array() { return new Float64Array(16); }
                    static fromMatrix() { return new DOMMatrix(); }
                    static fromFloat32Array() { return new DOMMatrix(); }
                    static fromFloat64Array() { return new DOMMatrix(); }
          };
  }
      if (typeof globalThis.Path2D === 'undefined') {
              (globalThis as any).Path2D = class Path2D {
                        constructor(_p?: any) {}
                        addPath() {} closePath() {} moveTo() {} lineTo() {}
                        bezierCurveTo() {} quadraticCurveTo() {} arc() {}
                        arcTo() {} ellipse() {} rect() {}
              };
      }

  try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
          const data = await pdfParse(buffer);
          const text = data.text || '';

        // Check if pdf-parse returned garbage
        if (hasGarbageText(text)) {
                  return '';
        }
          return text;
  } catch (err) {
          console.error('pdf-parse fallback failed:', err);
          return '';
  }
}

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
                            text = await extractTextFromPDF(buffer);

                    if (!text || text.length < 20) {
                                  return NextResponse.json(
                                      { error: "Could not extract readable text from this PDF. The PDF may use scanned images or custom fonts. Please try copy-pasting the text directly." },
                                      { status: 400 }
                                                );
                    }
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
