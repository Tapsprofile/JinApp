# JinApp

A pluggable React/Tailwind/Gemini API chat framework for building intelligent bot applications.

## Overview

JinApp is a flexible chat framework that allows you to easily create and deploy AI-powered chatbots with different contexts and capabilities. It leverages Google's Gemini API for natural language processing and supports advanced features like web search and vision capabilities.

## Features

### Core Components
- **BotWidget**: A customizable chat widget component that accepts BotConfig
- **BotConfig**: Configuration object with name, greeting, systemInstruction, color, and enableSearch
- **geminiService**: Service layer using `@google/generative-ai` with support for:
  - InlineData (Vision) - process images
  - Google Search tools - web-enhanced responses
  - Streaming responses with typing indicators

### Pre-configured Bot Contexts
1. **Customer Service Assistant** - Empathetic support bot
2. **E-Learning Tutor** - Educational assistant
3. **Supply Chain Management Assistant** - SCM specialist
4. **Procurement Bot** - Procurement process guide
5. **Mail Forum Helper** - Forum navigation assistant

### UI Features
- FAB (Floating Action Button) trigger
- Dynamic theming based on bot color
- Inter font family
- Typing loader animations
- Auto-scroll functionality
- Responsive design

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Configuration

1. Launch the application
2. Enter your Gemini API key when prompted
3. Select a bot from the available options
4. Start chatting!

## Project Structure

```
JinApp/
├── src/
│   ├── components/
│   │   └── BotWidget.tsx       # Main chat widget component
│   ├── services/
│   │   └── geminiService.ts    # Gemini API service layer
│   ├── contexts/
│   │   └── botContexts.ts      # Pre-configured bot definitions
│   ├── types/
│   │   └── bot.ts              # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles with Tailwind
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Creating Custom Bots

You can easily create your own bot configurations:

```typescript
import { BotConfig } from './types/bot';

const myCustomBot: BotConfig = {
  name: 'My Custom Bot',
  greeting: 'Hello! How can I assist you?',
  systemInstruction: 'You are a helpful assistant that...',
  color: '#6366f1', // Indigo color
  enableSearch: true, // Enable Google Search
};
```

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Google Generative AI** - AI capabilities
- **Inter Font** - Typography

## License

MIT
