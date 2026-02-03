# JinApp Usage Guide

## Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Tapsprofile/JinApp.git
cd JinApp

# Install dependencies
npm install
```

### 2. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for use in the application

### 3. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Using the Application

1. Open the application in your browser (typically `http://localhost:5173`)
2. Enter your Gemini API key when prompted
3. Select a bot from the available options
4. Click the FAB (💬) button to open the chat
5. Start chatting!

## Creating Custom Bots

### Basic Example

```typescript
import { BotConfig } from './types/bot';

const myCustomBot: BotConfig = {
  name: 'My Assistant',
  greeting: 'Hello! How can I help you today?',
  systemInstruction: 'You are a helpful assistant...',
  color: '#4f46e5', // Indigo
  enableSearch: true,
};
```

### System Instruction Best Practices

1. **Be Specific**: Clearly define the bot's role and responsibilities
2. **Set Boundaries**: Specify what the bot should and shouldn't do
3. **Include Examples**: Provide examples of good responses
4. **Define Tone**: Specify the desired communication style

Example:
```typescript
systemInstruction: `You are a technical support specialist for software applications.

Your responsibilities:
- Diagnose technical issues
- Provide step-by-step solutions
- Escalate complex problems when necessary

Guidelines:
- Always ask clarifying questions
- Provide clear, numbered steps
- Be patient and understanding
- Use simple, non-technical language when possible

Example interaction:
User: "The app won't open"
You: "I'll help you troubleshoot that. To better assist you, could you tell me:
1. What operating system are you using?
2. Do you see any error messages?
3. When did this issue start?"
`,
```

### Color Scheme

Choose colors that match your brand or bot purpose:

```typescript
// Professional
color: '#0f172a', // Slate

// Friendly
color: '#06b6d4', // Cyan

// Alert/Support
color: '#ef4444', // Red

// Success/Growth
color: '#22c55e', // Green

// Premium
color: '#a855f7', // Purple
```

## Advanced Features

### Using Vision (Image Processing)

The Gemini service supports image processing through the `inlineData` parameter:

```typescript
import { sendMessage } from './services/geminiService';

// Convert image to base64
const base64Image = '...'; // Your base64 encoded image

await sendMessage(
  model,
  'What do you see in this image?',
  {
    mimeType: 'image/jpeg',
    data: base64Image,
  }
);
```

### Enabling Web Search

Set `enableSearch: true` in your BotConfig to allow the bot to search the web for current information:

```typescript
const researchBot: BotConfig = {
  name: 'Research Assistant',
  greeting: 'I can help you research topics with up-to-date information!',
  systemInstruction: 'You are a research assistant with access to web search...',
  color: '#2563eb',
  enableSearch: true, // Enable web search
};
```

### Streaming Responses

The framework uses streaming by default for real-time chat experience:

```typescript
await sendMessageStreaming(
  model,
  message,
  (chunk) => {
    // This callback is called for each chunk of the response
    console.log('Received chunk:', chunk);
  }
);
```

## Customization

### Styling

The application uses Tailwind CSS. Customize the design by:

1. Editing `tailwind.config.js` for theme customization
2. Modifying component styles in `src/components/BotWidget.tsx`
3. Updating global styles in `src/index.css`

### Adding New Bots

1. Create a new bot configuration in `src/contexts/botContexts.ts`:

```typescript
export const myNewBot: BotConfig = {
  name: 'My New Bot',
  greeting: 'Welcome!',
  systemInstruction: '...',
  color: '#...',
  enableSearch: false,
};
```

2. Add it to the `defaultBots` array:

```typescript
export const defaultBots = [
  customerServiceBot,
  eLearningBot,
  scmBot,
  procurementBot,
  mailForumBot,
  myNewBot, // Add your new bot here
];
```

### Environment Variables

For production, you can use environment variables:

```bash
# .env
VITE_GEMINI_API_KEY=your_api_key_here
```

Then update `src/App.tsx` to use it:

```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
```

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Various Platforms

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
# Add to vite.config.ts
export default defineConfig({
  base: '/JinApp/',
  // ...
})

npm run build
# Push dist folder to gh-pages branch
```

## Troubleshooting

### API Key Issues

- **Error: "Gemini AI not initialized"**: Make sure you've entered a valid API key
- **Invalid API Key**: Verify your key at Google AI Studio
- **Rate Limits**: Check your API quota if requests are failing

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Browser Compatibility

The application works best on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Error Handling**: Always handle errors gracefully in production
3. **User Experience**: Keep system instructions concise but clear
4. **Performance**: Use streaming for better perceived performance
5. **Testing**: Test bots with various inputs before deployment

## Support

For issues or questions:
- Check the README.md
- Review the code in `src/` directory
- Examine example bots in `src/contexts/botContexts.ts`

## License

MIT License - Feel free to use and modify for your projects!
