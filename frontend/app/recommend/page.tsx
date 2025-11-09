'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { geminiApi, clipApi } from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function RecommendPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hi! I\'m your AI fashion stylist. Tell me about the outfit you\'re looking for - what\'s the occasion, weather, or style you prefer?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);

    // Advanced options
    const [occasion, setOccasion] = useState('');
    const [weather, setWeather] = useState('');
    const [stylePreference, setStylePreference] = useState('');
    const [colorPreference, setColorPreference] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        loadWardrobeItems();
    }, []);

    const loadWardrobeItems = async () => {
        try {
            const items = await clipApi.listItems();
            setWardrobeItems(items);
        } catch (error) {
            console.error('Error loading wardrobe:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await geminiApi.recommendOutfit({
                prompt: userMessage,
                occasion: occasion || undefined,
                weather: weather || undefined,
                style_preference: stylePreference || undefined,
                color_preference: colorPreference || undefined,
                available_items: wardrobeItems.length > 0 ? wardrobeItems : undefined,
            });

            let assistantMessage = '';
            if (response.success && response.full_text) {
                assistantMessage = response.full_text;
            } else if (response.recommendation) {
                const rec = response.recommendation;
                assistantMessage = `**${rec.outfit_description}**\n\n`;

                if (rec.items && rec.items.length > 0) {
                    assistantMessage += '**Items:**\n';
                    rec.items.forEach((item: any, idx: number) => {
                        assistantMessage += `${idx + 1}. ${item.description}\n`;
                    });
                    assistantMessage += '\n';
                }

                if (rec.reasoning) {
                    assistantMessage += `**Why this works:**\n${rec.reasoning}\n\n`;
                }

                if (rec.style_tips) {
                    assistantMessage += `**Style Tips:**\n${rec.style_tips}`;
                }
            } else {
                assistantMessage = 'Sorry, I couldn\'t generate a recommendation. Please try again.';
            }

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('Error getting recommendation:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the Gemini service is running and try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickPrompts = [
        'Suggest a casual weekend outfit',
        'What should I wear to a business meeting?',
        'Help me with a date night outfit',
        'I need something for a wedding',
        'Casual Friday work outfit',
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">AI Outfit Recommender</h1>
                            <p className="text-gray-600">Powered by Gemini AI</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Advanced Options */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between mb-4"
                            >
                                <h2 className="text-lg font-bold text-gray-900">Options</h2>
                                <span className="text-sm text-blue-600">
                                    {showAdvanced ? 'Hide' : 'Show'}
                                </span>
                            </button>

                            {showAdvanced && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Occasion
                                        </label>
                                        <select
                                            value={occasion}
                                            onChange={(e) => setOccasion(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        >
                                            <option value="">Any</option>
                                            <option value="casual">Casual</option>
                                            <option value="business">Business</option>
                                            <option value="formal">Formal</option>
                                            <option value="party">Party</option>
                                            <option value="date">Date</option>
                                            <option value="sports">Sports</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weather
                                        </label>
                                        <select
                                            value={weather}
                                            onChange={(e) => setWeather(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        >
                                            <option value="">Any</option>
                                            <option value="hot">Hot</option>
                                            <option value="warm">Warm</option>
                                            <option value="cool">Cool</option>
                                            <option value="cold">Cold</option>
                                            <option value="rainy">Rainy</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Style
                                        </label>
                                        <input
                                            type="text"
                                            value={stylePreference}
                                            onChange={(e) => setStylePreference(e.target.value)}
                                            placeholder="e.g., minimalist"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Color Preference
                                        </label>
                                        <input
                                            type="text"
                                            value={colorPreference}
                                            onChange={(e) => setColorPreference(e.target.value)}
                                            placeholder="e.g., earth tones"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500 mb-2">
                                            Wardrobe: {wardrobeItems.length} items
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {wardrobeItems.length > 0
                                                ? 'AI will consider your wardrobe'
                                                : 'Add items to wardrobe for personalized suggestions'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Prompts */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Quick Prompts
                                </h3>
                                <div className="space-y-2">
                                    {quickPrompts.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInput(prompt)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-200px)]">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                                                    <span className="font-semibold text-purple-600">AI Stylist</span>
                                                </div>
                                            )}
                                            <div className="whitespace-pre-wrap text-sm">
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <SparklesIcon className="h-5 w-5 text-purple-600 animate-pulse" />
                                                <span className="text-sm text-gray-600">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="border-t p-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Describe what you're looking for..."
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={loading || !input.trim()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
