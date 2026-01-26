# Keynote Builder - AI-Powered Presentation Generator

En webbapp som genererar professionella TED Talk-stil PowerPoint-presentationer från fritext, transkript eller anteckningar.

## ✨ Funktioner

- **AI-driven innehållsstrukturering** - Claude analyserar ditt material och skapar en professionell presentationsstruktur
- **TED Talk-format** - Beprövad struktur med hook, problem, story, insikter och call-to-action
- **Flera presentationstyper** - Keynote, Educational, Pitch, Workshop, Summary, Proposal
- **Flerspråkigt** - Svenska och engelska
- **Anpassningsbara färgteman** - Fördefinierade paletter eller egna hex-koder
- **Speaker notes** - 1-2 minuters talarnotiser per slide
- **Filuppladdning** - Stöd för PDF, Word, textfiler och ljudtranskription
- **Direktnedladdning** - Genererar .pptx-filer redo för PowerPoint/Keynote

## 🚀 Kom igång

### 1. Klona repot
```bash
git clone https://github.com/ditt-användarnamn/presentation-generators.git
cd presentation-generators
```

### 2. Installera dependencies
```bash
npm install
```

### 3. Konfigurera miljövariabler
Skapa en `.env.local` fil i root:
```env
ANTHROPIC_API_KEY=din-claude-api-nyckel
```

### 4. Starta utvecklingsservern
```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i webbläsaren.

## 🛠 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **AI:** Claude API (Anthropic)
- **PPT-generering:** PptxGenJS
- **Deploy:** Vercel

## 📁 Projektstruktur

```
├── app/
│   ├── page.tsx              # Huvudsida med formulär
│   ├── api/
│   │   ├── generate/         # Claude API för innehållsstrukturering
│   │   ├── download/         # PPT-generering och nedladdning
│   │   ├── parse-file/       # Filuppladdning (PDF, Word, etc.)
│   │   ├── transcribe/       # Ljudtranskription
│   │   └── enhance-prompt/   # Prompt-förbättring
│   └── layout.tsx
├── components/
│   ├── InputForm.tsx         # Huvudformulär för input
│   ├── StyleSelector.tsx     # Färg- och stilval
│   ├── PreviewPanel.tsx      # Förhandsvisning av slides
│   ├── SlideEditor.tsx       # Redigera enskilda slides
│   └── DownloadButton.tsx    # Ladda ner presentation
├── lib/
│   ├── claude.ts             # Claude API wrapper
│   ├── pptx-generator.ts     # PptxGenJS logik
│   ├── palettes.ts           # Färgscheman
│   └── types.ts              # TypeScript-typer
```

## 🎨 Tillgängliga färgteman

- **Doings** - Rosa/magenta, korall, guld, teal (mörk bakgrund)
- **Corporate** - Blå, grön, orange (professionell)
- **Bold** - Röd, gul, cyan (hög kontrast)
- **Custom** - Välj egna hex-koder

## 📝 Användning

1. **Mata in innehåll** - Klistra in transkript, mötesanteckningar, artikeltext eller ladda upp en fil
2. **Välj inställningar** - Presentationstyp, målgrupp, längd, språk
3. **Anpassa stil** - Välj färgtema och bakgrundsstil
4. **Generera** - Klicka "Generera presentation"
5. **Redigera** (valfritt) - Justera enskilda slides vid behov
6. **Ladda ner** - Hämta din .pptx-fil

## ⚠️ Viktigt: Isolering mellan presentationer

Varje presentation genereras helt fristående. AI:n:
- Refererar **aldrig** till tidigare genererade presentationer
- Använder **endast** innehåll från din nuvarande input
- Väver **inte** in ämnen som inte finns i ditt material

Om du matar in text om hållbarhet får du en presentation om hållbarhet - inte om AI, ledarskap eller andra ämnen från tidigare sessioner.

## 🔧 Miljövariabler

| Variabel | Beskrivning | Krävs |
|----------|-------------|-------|
| `ANTHROPIC_API_KEY` | Din Claude API-nyckel | Ja |
| `OPENAI_API_KEY` | För bildgenerering (framtida feature) | Nej |

## 📦 Deploy till Vercel

1. Pusha koden till GitHub
2. Importera repot i [Vercel](https://vercel.com)
3. Lägg till `ANTHROPIC_API_KEY` i Environment Variables
4. Deploy!

## 🗺 Roadmap

- [ ] AI-genererade bilder per slide
- [ ] Exportera till Google Slides
- [ ] Spara och återanvänd mallar
- [ ] Team-funktionalitet
- [ ] Integration med Otter.ai, Fireflies

## 📄 Licens

MIT

---

Byggt med ❤️ av Doings - *for a Change!*
