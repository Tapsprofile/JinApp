import { useState, useEffect } from 'react';
import { BotWidget } from './components/BotWidget';
import { BotConfig } from './types/bot';
import { defaultBots } from './contexts/botContexts';
import { initializeGemini } from './services/geminiService';

function App() {
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showApiInput, setShowApiInput] = useState(true);

  useEffect(() => {
    // Check if API key is already saved in localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      initializeGemini(savedApiKey);
      setIsConfigured(true);
      setShowApiInput(false);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      initializeGemini(apiKey.trim());
      setIsConfigured(true);
      setShowApiInput(false);
    }
  };

  const handleResetApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsConfigured(false);
    setShowApiInput(true);
    setSelectedBot(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">JinApp</h1>
              <p className="text-sm text-gray-600 mt-1">
                Pluggable React/Tailwind/Gemini API Chat Framework
              </p>
            </div>
            {isConfigured && (
              <button
                onClick={handleResetApiKey}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset API Key
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isConfigured ? (
          /* API Key Configuration */
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Configure Gemini API
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your Google Gemini API key to get started. You can get one from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Google AI Studio
              </a>
              .
            </p>
            <div className="space-y-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
              />
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Continue
              </button>
            </div>
          </div>
        ) : (
          /* Bot Selection */
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Choose Your Assistant
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultBots.map((bot) => (
                <div
                  key={bot.name}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                  onClick={() => setSelectedBot(bot)}
                >
                  <div
                    className="h-3"
                    style={{ backgroundColor: bot.color }}
                  ></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {bot.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {bot.greeting}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {bot.enableSearch ? '🔍 Web Search Enabled' : '💬 Chat Only'}
                      </span>
                      <button
                        className="px-4 py-2 rounded-lg text-white font-medium text-sm hover:shadow-md transition-all"
                        style={{ backgroundColor: bot.color }}
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                About JinApp
              </h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>
                  <strong>Core Features:</strong> BotWidget component with pluggable
                  BotConfig (name, greeting, systemInstruction, color, enableSearch)
                </p>
                <p>
                  <strong>Service:</strong> geminiService.ts using @google/generative-ai
                  with support for Vision (inlineData) and Google Search tools
                </p>
                <p>
                  <strong>Contexts:</strong> Pre-configured bots for Customer Service,
                  E-Learning, Supply Chain Management, Procurement, and Mail Forums
                </p>
                <p>
                  <strong>UI:</strong> FAB-triggered chat, dynamic theming, Inter font,
                  typing indicators, and auto-scroll
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Render selected bot widget */}
      {selectedBot && <BotWidget config={selectedBot} />}
    </div>
  );
}

export default App;
