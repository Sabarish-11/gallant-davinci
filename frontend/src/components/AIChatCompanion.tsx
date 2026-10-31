import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, X, ArrowUpRight } from 'lucide-react';
import API from '../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

const AIChatCompanion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Hi! I am your AI Campus Companion. Ask me about your academic standing, risk triggers, or career pathway goals.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await API.post('/ai/chat', { message: userMessage });
      if (res.data.success) {
        setMessages(prev => [...prev, { sender: 'assistant', text: res.data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'assistant', text: 'Sorry, I failed to process that request.' }]);
      }
    } catch (err: any) {
      console.error('AI query failure:', err);
      setMessages(prev => [...prev, { sender: 'assistant', text: 'I ran into an error connecting to the API. Make sure the server is online.' }]);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 px-5 py-4 bg-slate-900 text-white rounded-full shadow-premium hover:bg-slate-800 transition-all hover:scale-105 group border border-slate-700/50"
        >
          <Sparkles className="h-5 w-5 text-brand-400 group-hover:animate-pulse" />
          <span className="font-semibold text-sm">Ask Campus AI</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-card-hover border border-slate-100 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-500 rounded-lg">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Campus Companion</h3>
                <span className="text-[10px] text-brand-300 font-semibold tracking-wide uppercase">AI Advisor</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none leading-relaxed'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="whitespace-pre-line prose prose-sm">{msg.text}</div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-soft flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions List (only shows when input is empty and not loading) */}
          {input.length === 0 && !loading && (
            <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto">
              <button
                onClick={() => selectSuggestion('Why is my academic risk high?')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-full flex items-center gap-0.5 whitespace-nowrap transition-colors"
              >
                Risk Status <ArrowUpRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => selectSuggestion('What should I learn for my career goal?')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-full flex items-center gap-0.5 whitespace-nowrap transition-colors"
              >
                Skills Gap <ArrowUpRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => selectSuggestion('Tell me my attendance summary.')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-full flex items-center gap-0.5 whitespace-nowrap transition-colors"
              >
                Attendance <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatCompanion;
