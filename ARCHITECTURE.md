# JinApp Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         JinApp                              │
│         Pluggable React/Tailwind/Gemini Chat Framework      │
└─────────────────────────────────────────────────────────────┘

## Component Architecture

┌──────────────────────────────────────────────────────────────┐
│                        User Interface                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐        ┌────────────────────────┐         │
│  │   App.tsx    │───────▶│  Bot Selection Grid    │         │
│  │              │        │  - 5 Pre-configured    │         │
│  │ - API Setup  │        │  - Dynamic Cards       │         │
│  │ - Bot Mgmt   │        │  - Color Themes        │         │
│  └──────────────┘        └────────────────────────┘         │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────────────────────────────────────┐           │
│  │         BotWidget Component                  │           │
│  │  ┌────────────────────────────────────┐     │           │
│  │  │  Header (Dynamic Theme)            │     │           │
│  │  │  - Bot Name                        │     │           │
│  │  │  - Search Status                   │     │           │
│  │  │  - Close Button                    │     │           │
│  │  └────────────────────────────────────┘     │           │
│  │  ┌────────────────────────────────────┐     │           │
│  │  │  Message Area (Auto-scroll)        │     │           │
│  │  │  - User Messages (Theme colored)   │     │           │
│  │  │  - Assistant Messages (White)      │     │           │
│  │  │  - Typing Indicator (Animated)     │     │           │
│  │  │  - Streaming Messages              │     │           │
│  │  └────────────────────────────────────┘     │           │
│  │  ┌────────────────────────────────────┐     │           │
│  │  │  Input Area                        │     │           │
│  │  │  - Text Input Field                │     │           │
│  │  │  - Send Button (Theme colored)     │     │           │
│  │  └────────────────────────────────────┘     │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  FAB (Floating Action Button)                │           │
│  │  - Theme colored                             │           │
│  │  - Toggle chat visibility                    │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└──────────────────────────────────────────────────────────────┘

## Service Layer

┌──────────────────────────────────────────────────────────────┐
│                    geminiService.ts                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  initializeGemini(apiKey)                  │             │
│  │  - Creates GoogleGenerativeAI instance     │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  getGeminiModel(instruction, enableSearch) │             │
│  │  - Model: gemini-2.0-flash-exp            │             │
│  │  - System Instruction                      │             │
│  │  - Optional: googleSearchRetrieval tool    │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  sendMessage(model, message, imageData?)   │             │
│  │  - Text messages                           │             │
│  │  - Optional: inlineData (Vision)           │             │
│  │  - Returns: Complete response              │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  sendMessageStreaming(...)                 │             │
│  │  - Real-time streaming responses           │             │
│  │  - Chunk-by-chunk delivery                 │             │
│  │  - onChunk callback for each chunk         │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
└──────────────────────────────────────────────────────────────┘

## Data Layer

┌──────────────────────────────────────────────────────────────┐
│                      Type Definitions                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  interface BotConfig {                                        │
│    name: string;                                              │
│    greeting: string;                                          │
│    systemInstruction: string;                                 │
│    color: string;                                             │
│    enableSearch?: boolean;                                    │
│  }                                                            │
│                                                               │
│  interface Message {                                          │
│    role: 'user' | 'assistant';                               │
│    content: string;                                           │
│    timestamp: Date;                                           │
│  }                                                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Bot Context Definitions                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  customerServiceBot    │  Blue (#3b82f6)   │  Search: ✓     │
│  eLearningBot          │  Green (#10b981)  │  Search: ✓     │
│  scmBot                │  Amber (#f59e0b)  │  Search: ✓     │
│  procurementBot        │  Purple (#8b5cf6) │  Search: ✓     │
│  mailForumBot          │  Pink (#ec4899)   │  Search: ✗     │
│                                                               │
└──────────────────────────────────────────────────────────────┘

## External Services

┌──────────────────────────────────────────────────────────────┐
│                    Google Gemini API                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Model: gemini-2.0-flash-exp                                 │
│                                                               │
│  Features Used:                                               │
│  ✓ Text Generation                                           │
│  ✓ Streaming Responses                                       │
│  ✓ System Instructions                                       │
│  ✓ Google Search Retrieval Tool                              │
│  ✓ Vision API (inlineData)                                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘

## State Management

┌──────────────────────────────────────────────────────────────┐
│                      React State (Hooks)                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  App Level:                                                   │
│  - selectedBot: BotConfig | null                             │
│  - apiKey: string                                             │
│  - isConfigured: boolean                                      │
│                                                               │
│  BotWidget Level:                                             │
│  - isOpen: boolean                                            │
│  - messages: Message[]                                        │
│  - input: string                                              │
│  - isLoading: boolean                                         │
│  - streamingMessage: string                                   │
│                                                               │
│  LocalStorage:                                                │
│  - gemini_api_key                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘

## Technology Stack

┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  Frontend Framework:    React 18.3                           │
│  Type Safety:           TypeScript 5.7                       │
│  Build Tool:            Vite 5.4                             │
│  Styling:               Tailwind CSS 3.4                     │
│  AI Service:            @google/generative-ai 0.21           │
│  Font:                  Inter (Google Fonts)                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘

## Data Flow

1. User enters API key → Stored in localStorage → Initialize Gemini
2. User selects bot → BotConfig loaded → FAB button appears
3. User clicks FAB → BotWidget opens → Greeting message displayed
4. User types message → Send to Gemini API → Stream response
5. Response chunks → Update UI in real-time → Auto-scroll to bottom
6. User closes chat → Widget hidden → FAB button shown again

## Key Features

✓ Pluggable architecture - Easy to add new bots
✓ Dynamic theming - Each bot has unique color
✓ Real-time streaming - Immediate response feedback
✓ Vision support - Can process images via inlineData
✓ Web search - Enhanced responses with current information
✓ Type-safe - Full TypeScript coverage
✓ Responsive design - Works on all screen sizes
✓ Accessible - Proper ARIA labels and semantic HTML
✓ Auto-scroll - Always shows latest messages
✓ Persistent config - API key saved locally
