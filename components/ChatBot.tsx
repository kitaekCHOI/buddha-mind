import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { createMonkChat, sendMessageStream } from '../services/gemini';
import { Chat } from '@google/genai';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '어서 오십시오, 불자님. 무엇이 마음을 어지럽히고 있습니까? 편안하게 말씀해 주십시오.',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to persist the chat session instance across renders
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize chat only once
  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createMonkChat();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming || !chatSessionRef.current) return;

    const userText = inputValue;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);

    // Create a placeholder for the monk's response
    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: '', // Start empty
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, initialBotMsg]);

    try {
      const stream = sendMessageStream(chatSessionRef.current, userText);
      let fullText = "";

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => 
        prev.map(msg => 
            msg.id === botMsgId 
            ? { ...msg, text: msg.text + "\n(통신에 어려움이 있었습니다.)" } 
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 py-4 px-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Avatar / Name */}
              <div className="flex items-center space-x-2 mb-1 px-1">
                 {msg.role === 'model' ? (
                   <>
                    <span className="text-xs font-bold text-monk-700">마음의 등불</span>
                   </>
                 ) : (
                   <span className="text-xs font-bold text-stone-500">나</span>
                 )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-stone-700 text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
                }`}
              >
                {msg.text || (
                  <span className="inline-flex items-center space-x-1">
                    <Loader2 size={14} className="animate-spin text-monk-500" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 relative">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="고민이나 궁금한 점을 적어보세요..."
          className="w-full bg-white border border-stone-200 rounded-2xl pl-4 pr-12 py-3 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-monk-500/20 focus:border-monk-500 resize-none shadow-sm h-14"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isStreaming}
          className="absolute right-2 top-2 p-2 bg-monk-500 text-white rounded-xl hover:bg-monk-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;