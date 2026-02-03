import type { CSSProperties, FormEvent } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, ImagePlus, Send, X } from "lucide-react";

import type { BotConfig } from "../configs";
import type { GeminiRequest, InlineImage } from "../services/geminiService";
import { generateGeminiResponse } from "../services/geminiService";

type WidgetImage = InlineImage & {
  id: string;
  name: string;
  previewUrl: string;
};

type WidgetMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  images?: WidgetImage[];
};

export type GeminiService = (request: GeminiRequest) => Promise<string>;

export interface BotWidgetProps {
  apiKey: string;
  config: BotConfig;
  model?: string;
  className?: string;
  initiallyOpen?: boolean;
  service?: GeminiService;
}

const createId = () =>
  `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

// Convert images to Base64 data URLs for Gemini vision.
const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <span
      className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
      style={{ animationDelay: "0ms" }}
    />
    <span
      className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
      style={{ animationDelay: "120ms" }}
    />
    <span
      className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
      style={{ animationDelay: "240ms" }}
    />
  </div>
);

export const BotWidget = ({
  apiKey,
  config,
  model = "gemini-2.0-flash",
  className,
  initiallyOpen = false,
  service = generateGeminiResponse,
}: BotWidgetProps) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<WidgetImage[]>([]);
  const [fabVisible, setFabVisible] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([
    { id: "greeting", role: "model", text: config.greeting },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  // Apply primary color via CSS variable for theming.
  const themeStyle = useMemo(
    () =>
      ({
        "--jinapp-primary": config.primaryColor,
      }) as CSSProperties,
    [config.primaryColor],
  );

  // Reset conversation when a new bot config is injected.
  useEffect(() => {
    setMessages([{ id: "greeting", role: "model", text: config.greeting }]);
    setPendingImages([]);
    setInput("");
    setIsLoading(false);
  }, [config.id, config.greeting]);

  useEffect(() => {
    const timer = setTimeout(() => setFabVisible(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    try {
      const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
      setPendingImages((prev) => [
        ...prev,
        ...dataUrls.map((dataUrl, index) => {
          const base64 = dataUrl.split(",")[1] ?? "";
          const file = files[index];
          return {
            id: createId(),
            name: file.name,
            mimeType: file.type || "image/*",
            data: base64,
            previewUrl: dataUrl,
          };
        }),
      ]);
    } catch (error) {
      console.error("Failed to read image", error);
    } finally {
      event.target.value = "";
    }
  };

  const handleSend = async () => {
    if (isLoading) return;
    const trimmedInput = input.trim();
    if (!trimmedInput && pendingImages.length === 0) return;

    const userMessage: WidgetMessage = {
      id: createId(),
      role: "user",
      text: trimmedInput,
      images: pendingImages,
    };

    // Build the full conversation, including inline image data.
    const conversation = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingImages([]);
    setIsLoading(true);

    try {
      const responseText = await service({
        apiKey,
        model,
        systemInstruction: config.systemInstruction,
        enableSearch: config.enableSearch,
        messages: conversation.map((message) => ({
          role: message.role,
          text: message.text,
          images: message.images?.map((image) => ({
            mimeType: image.mimeType,
            data: image.data,
          })),
        })),
      });

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "model", text: responseText },
      ]);
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : "Unexpected error occurred.";
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "model",
          text: `Sorry, I ran into an issue: ${fallback}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => prev.filter((image) => image.id !== id));
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 ${
        className ?? ""
      }`}
      style={themeStyle}
    >
      <div
        className={`w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 text-white bg-[var(--jinapp-primary)]">
          <div className="flex items-center gap-2">
            {config.avatarUrl ? (
              <img
                src={config.avatarUrl}
                alt={`${config.name} avatar`}
                className="h-8 w-8 rounded-full object-cover border border-white/30"
              />
            ) : (
              <Bot className="h-5 w-5" />
            )}
            <div>
              <p className="text-sm font-semibold leading-tight">{config.name}</p>
              <p className="text-xs opacity-80">JinApp Assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 hover:bg-white/10 transition"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 max-h-[420px] overflow-y-auto bg-slate-50 px-4 py-4 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? "bg-[var(--jinapp-primary)] text-white"
                      : "bg-white text-slate-800 border border-slate-200"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">
                      {message.text || "Image attached."}
                    </p>
                  ) : (
                    <ReactMarkdown className="prose prose-slate max-w-none text-sm">
                      {message.text}
                    </ReactMarkdown>
                  )}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.previewUrl}
                          alt={image.name}
                          className="h-16 w-16 rounded-md object-cover border border-white/30"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-white border border-slate-200 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        {pendingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2 bg-white border-t border-slate-100">
            {pendingImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.previewUrl}
                  alt={image.name}
                  className="h-12 w-12 rounded-md object-cover border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removePendingImage(image.id)}
                  className="absolute -top-2 -right-2 rounded-full bg-white shadow p-1"
                  aria-label={`Remove ${image.name}`}
                >
                  <X className="h-3 w-3 text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 px-4 py-3 bg-white"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jinapp-primary)]"
              disabled={isLoading}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 transition"
              aria-label="Attach image"
            >
              <ImagePlus className="h-4 w-4 text-slate-600" />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-[var(--jinapp-primary)] px-3 py-2 text-white shadow hover:brightness-110 transition disabled:opacity-60"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-14 w-14 rounded-full bg-[var(--jinapp-primary)] text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-out ${
          isOpen ? "rotate-45" : "rotate-0"
        } ${fabVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        aria-label="Toggle chat widget"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>
    </div>
  );
};
