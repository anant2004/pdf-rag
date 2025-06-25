'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Search, Palette, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatInterfaceProps {
    className?: string;
    onMessageSend?: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    className = "",
    onMessageSend
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hello! I'm your AI assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Custom message handler
        if (onMessageSend) {
            onMessageSend(inputValue);
        }

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: generateAIResponse(inputValue),
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 2000);
    };

    const generateAIResponse = (userMessage: string): string => {
        const responses = [
            "That's an interesting question! Let me think about that...",
            "I understand what you're asking. Here's my perspective on that topic...",
            "Great question! Based on my knowledge, I can tell you that...",
            "I'd be happy to help you with that. Let me provide some insights...",
            "That's a thoughtful inquiry. From what I understand...",
            "I can definitely assist with that. Here's what I think...",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return `${randomResponse} "${userMessage}"`;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputValue]);

    return (
        <div className={`flex flex-col h-screen bg-[#212121] text-gray-100 rounded-2xl ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold">AI Assistant</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                        <Search className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-start space-x-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {message.sender === 'ai' && (
                                <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600">
                                    <AvatarFallback className="bg-transparent">
                                        <Bot className="w-4 h-4 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                                    ? 'bg-[#041021] text-white ml-auto'
                                    : 'bg-[#000] text-gray-100'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </p>

                            </div>

                            {message.sender === 'user' && (
                                <Avatar className="w-8 h-8 bg-gray-700">
                                    <AvatarFallback className="bg-transparent">
                                        <User className="w-4 h-4 text-gray-300" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-start space-x-4">
                            <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600">
                                <AvatarFallback className="bg-transparent">
                                    <Bot className="w-4 h-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-800 rounded-2xl px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800">
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-[#303030] rounded-3xl border border-neutral-400">
                        <div className="flex items-end space-x-2 p-3">

                            <Textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 min-h-[20px] max-h-[120px] bg-transparent border-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none resize-none text-gray-100 placeholder-gray-500"
                                rows={1}
                            />

                            <div className="flex items-center space-x-2 shrink-0">
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isTyping}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-2">
                        AI can make mistakes, so double-check important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;