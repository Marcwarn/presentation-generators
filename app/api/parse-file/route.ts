import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime for pdf-parse compatibility
export const runtime = 'nodejs';

// Polyfill DOMMatrix for pdf-parse/pdfjs-dist in Node.js environment
if (typeof globalThis.DOMMatrix === 'undefined') {
    class DOMMatrixPolyfill {
          a: number; b: number; c: number; d: number; e: number; f: number;
          m11: number; m12: number; m13: number; m14: number;
          m21: number; m22: number; m23: number; m24: number;
          m31: number; m32: number; m33: number; m34: number;
          m41: number; m42: number; m43: number; m44: number;
          is2D: boolean; isIdentity: boolean;

      constructor(init?: string | number[]) {
              // Identity matrix defaults
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
              this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
              this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
              this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
              this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
              this.is2D = true;
              this.isIdentity = true;

            if (Array.isArray(init)) {
                      if (init.length === 6) {
                                  this.a = this.m11 = init[0];
                                  this.b = this.m12 = init[1];
                                  this.c = this.m21 = init[2];
                                  this.d = this.m22 = init[3];
                                  this.e = this.m41 = init[4];
                                  this.f = this.m42 = init[5];
                      } else if (init.length === 16) {
                                  this.m11 = init[0]; this.m12 = init[1]; this.m13 = init[2]; this.m14 = init[3];
                                  this.m21 = init[4]; this.m22 = init[5]; this.m23 = init[6]; this.m24 = init[7];
                                  this.m31 = init[8]; this.m32 = init[9]; this.m33 = init[10]; this.m34 = init[11];
                                  this.m41 = init[12]; this.m42 = init[13]; this.m43 = init[14]; this.m44 = init[15];
                                  this.a = this.m11; this.b = this.m12; this.c = this.m21; this.d = this.m22;
                                  this.e = this.m41; this.f = this.m42;
                                  this.is2D = false;
                      }
                      this.isIdentity = false;
            } else if (typeof init === 'string' && init.trim()) {
                      // Parse CSS transform string (basic support)
                const match = init.match(/matrix\(([^)]+)\)/);
                      if (match) {
                                  const values = match[1].split(',').map(Number);
                                  if (values.length === 6) {
                                                this.a = this.m11 = values[0];
                                                this.b = this.m12 = values[1];
                                                this.c = this.m21 = values[2];
                                                this.d = this.m22 = values[3];
                                                this.e = this.m41 = values[4];
                                                this.f = this.m42 = values[5];
                                                this.isIdentity = false;
                                  }
                      }
            }
      }

      static fromMatrix(other?: any) {
              return new DOMMatrixPolyfill();
      }

      static fromFloat32Array(array: Float32Array) {
              return new DOMMatrixPolyfill(Array.from(array));
      }

      static fromFloat64Array(array: Float64Array) {
              return new DOMMatrixPolyfill(Array.from(array));
      }

      inverse() { return new DOMMatrixPolyfill(); }
          multiply(other?: any) { return new DOMMatrixPolyfill(); }
          translate(tx?: number, ty?: number, tz?: number) { return new DOMMatrixPolyfill(); }
          scale(scaleX?: number, scaleY?: number, scaleZ?: number) { return new DOMMatrixPolyfill(); }
          rotate(rotX?: number, rotY?: number, rotZ?: number) { return new DOMMatrixPolyfill(); }
          flipX() { return new DOMMatrixPolyfill(); }
          flipY() { return new DOMMatrixPolyfill(); }
          transformPoint(point?: any) { return { x: 0, y: 0, z: 0, w: 1 }; }
          toFloat32Array() { return new Float32Array(16); }
          toFloat64Array() { return new Float64Array(16); }
          toJSON() { return {}; }
          toString() { return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`; }
    }
    (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
}

// Also polyfill Path2D if missing (needed by some pdfjs-dist versions)
if (typeof globalThis.Path2D === 'undefined') {
    (globalThis as any).Path2D = class Path2D {
          constructor(_path?: string | Path2D) {}
          addPath(_path: Path2D, _transform?: any) {}
          closePath() {}
          moveTo(_x: number, _y: number) {}
          lineTo(_x: number, _y: number) {}
          bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number) {}
          quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number) {}
          arc(_x: number, _y: number, _radius: number, _startAngle: number, _endAngle: number, _counterclockwise?: boolean) {}
          arcTo(_x1: number, _y1: number, _x2: number, _y2: number, _radius: number) {}
          ellipse(_x: number, _y: number, _radiusX: number, _radiusY: number, _rotation: number, _startAngle: number, _endAngle: number, _counterclockwise?: boolean) {}
          rect(_x: number, _y: number, _w: number, _h: number) {}
    };
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
                      try {
                                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const pdfParse = require('pdf-parse');
                                  const data = await pdfParse(buffer);
                                  text = data.text;
                      } catch (pdfError: any) {
                                  console.error("PDF parse error:", pdfError);
                                  // Fallback: try to extract raw text from PDF buffer
                        const rawText = buffer.toString('utf-8');
                                  const textMatches = rawText.match(/\(([^)]+)\)/g);
                                  if (textMatches && textMatches.length > 10) {
                                                text = textMatches
                                                  .map(m => m.slice(1, -1))
                                                  .filter(t => t.length > 1 && /[a-zA-Z]/.test(t))
                                                  .join(' ');
                                  }
                                  if (!text || text.length < 50) {
                                                throw new Error(
                                                                `PDF parsing failed: ${pdfError.message || 'Unknown error'}. ` +
                                                                'This may be due to a server environment limitation. ' +
                                                                'Try copy-pasting the text directly instead.'
                                                              );
                                  }
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
