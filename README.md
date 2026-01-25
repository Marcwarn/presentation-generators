# TED Talk Presentation Generator

Transform your content into professional TED Talk-style PowerPoint presentations using AI.

![TED Talk Generator](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Claude AI](https://img.shields.io/badge/Claude-AI-purple?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## Features

- **AI-Powered Structure**: Claude AI analyzes your content and creates a compelling TED Talk structure
- **Multiple Slide Types**: Statement, Story, List, Comparison, Timeline, and Call-to-Action slides
- **Customizable Themes**: Three color palettes (Doings, Corporate, Bold) with dark/light/gradient backgrounds
- **Speaker Notes**: Automatically generated speaking notes for each slide
- **Real-Time Preview**: See your presentation before downloading
- **Downloadable PPTX**: Export as a professional PowerPoint file

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Claude API key from [Anthropic](https://console.anthropic.com/)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ted-talk-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.local.example .env.local
```

4. Add your Claude API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ted-talk-generator/
├── app/
│   ├── api/
│   │   ├── generate/route.ts    # Claude API endpoint
│   │   └── download/route.ts    # PPTX generation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main application page
├── components/
│   ├── InputForm.tsx            # Content input form
│   ├── StyleSelector.tsx        # Theme customization
│   ├── PreviewPanel.tsx         # Slide preview
│   └── DownloadButton.tsx       # Download functionality
├── lib/
│   ├── claude.ts                # Claude API wrapper
│   ├── palettes.ts              # Color schemes
│   ├── pptx-generator.ts        # PowerPoint generation
│   └── types.ts                 # TypeScript types
└── package.json
```

## TED Talk Structure

The generator follows a proven TED Talk format:

1. **Hook** - Capture attention with a bold statement
2. **Problem** - Define the challenge
3. **Story** - Share a real example
4. **Insight** - Reveal what you learned
5. **Framework** - Provide a new way to think
6. **Practical** - Offer concrete steps
7. **Call to Action** - Inspire action

## Color Palettes

### Doings (Default)
- Primary: Magenta (#E85A9C)
- Secondary: Coral (#F5A68C)
- Accent: Gold (#C9A227)
- Contrast: Teal (#4A7C7C)

### Corporate
- Primary: Blue (#3182ce)
- Secondary: Light Blue (#63b3ed)
- Accent: Orange (#f6ad55)
- Contrast: Green (#48bb78)

### Bold
- Primary: Red (#ff6b6b)
- Secondary: Yellow (#feca57)
- Accent: Cyan (#48dbfb)
- Contrast: Green (#1dd1a1)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your `ANTHROPIC_API_KEY` environment variable
4. Deploy!

### Manual Build

```bash
npm run build
npm start
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Claude API (Anthropic)
- **PPT Generation**: PptxGenJS
- **Icons**: Lucide React

## License

MIT License - feel free to use this for your own projects!

## Contributing

Contributions are welcome! Please open an issue or submit a PR.
