import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  TrendingDown,
  Wallet,
  Target,
  PiggyBank,
  PieChart,
  Lightbulb,
} from 'lucide-react';
import { useFinance } from '../context/FinancialContext';

const QUICK_PROMPTS = [
  { text: 'How much did I spend this month?', icon: TrendingDown },
  { text: 'How much money do I have left?', icon: Wallet },
  { text: 'Help me create a monthly budget', icon: Target },
  { text: 'I want to save ₹10,000', icon: PiggyBank },
  { text: 'Where am I spending the most?', icon: PieChart },
  { text: 'Give me tips to reduce my expenses', icon: Lightbulb },
];

export default function AIAssistant() {
  const { chatMessages, sendAiMessage, aiStatus } = useFinance();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    setInputText('');
    setIsTyping(true);

    try {
      await sendAiMessage(text.trim());
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-h-[850px] bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">AI Financial Assistant</h2>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to live financial state & accounts
            </p>
          </div>
        </div>

        {/* Engine Transparency Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block leading-tight">Engine</span>
            <span className="font-semibold text-slate-800">
              {aiStatus?.provider === 'ibm-watson' ? 'IBM Watson Assistant' : 'Finance NLP Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/30">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isUser
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal space-y-1">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-bold text-slate-900">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>

                {/* Metadata & suggestions */}
                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.provider && (
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 bg-slate-100 rounded text-slate-500">
                      {msg.provider}
                    </span>
                  )}
                </div>

                {/* Suggestion action pills from Assistant */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-[11px] font-medium px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 rounded-lg text-slate-600 transition shadow-2xs"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0 font-medium mr-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Quick Ask:</span>
        </div>
        {QUICK_PROMPTS.map((prompt, i) => {
          const Icon = prompt.icon;
          return (
            <button
              key={i}
              onClick={() => handleSend(prompt.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-medium whitespace-nowrap transition flex-shrink-0 shadow-2xs"
            >
              <Icon className="w-3 h-3 text-slate-400" />
              <span>{prompt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200/90 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your expenses, savings, budget, or financial tips..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shadow-sm shadow-blue-500/20 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
