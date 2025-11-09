'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { clipApi } from '@/lib/api';

interface ClothingItem {
    item_id: string;
    category?: string;
    color?: string;
    style?: string;
    description?: string;
    filename?: string;
}

export default function WardrobePage() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchMode, setSearchMode] = useState<'none' | 'text' | 'image'>('none');

    // Form states
    const [category, setCategory] = useState('');
    const [color, setColor] = useState('');
    const [style, setStyle] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await clipApi.listItems();
            setItems(data);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const metadata = {
                category: category || undefined,
                color: color || undefined,
                style: style || undefined,
                description: description || undefined,
            };

            await clipApi.uploadItem(file, metadata);

            // Reset form
            setCategory('');
            setColor('');
            setStyle('');
            setDescription('');
            e.target.value = '';

            // Reload items
            await loadItems();
            alert('Item uploaded successfully!');
        } catch (error) {
            console.error('Error uploading item:', error);
            alert('Failed to upload item');
        } finally {
            setUploading(false);
        }
    };

    const handleTextSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const results = await clipApi.searchByText(searchQuery, 10);
            setSearchResults(results);
            setSearchMode('text');
        } catch (error) {
            console.error('Error searching:', error);
            alert('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const results = await clipApi.searchByImage(file, 10);
            setSearchResults(results);
            setSearchMode('image');
            e.target.value = '';
        } catch (error) {
            console.error('Error searching by image:', error);
            alert('Image search failed');
        } finally {
            setLoading(false);
        }
    };

    const displayedItems = searchMode !== 'none' ? searchResults : items;

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
                            <h1 className="text-3xl font-bold text-gray-900">Virtual Wardrobe</h1>
                            <p className="text-gray-600">Upload and manage your clothing items</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Upload & Search */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Upload Section */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Item</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select category</option>
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                        <option value="dress">Dress</option>
                                        <option value="outerwear">Outerwear</option>
                                        <option value="shoes">Shoes</option>
                                        <option value="accessory">Accessory</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="e.g., blue, red"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Style
                                    </label>
                                    <input
                                        type="text"
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                        placeholder="e.g., casual, formal"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional description"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <label className="block">
                                    <div className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                        <div className="space-y-2 text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold text-blue-600">Click to upload</span>
                                                <p className="text-xs">PNG, JPG up to 10MB</p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </div>
                                </label>

                                {uploading && (
                                    <div className="text-center text-sm text-gray-600">
                                        Uploading...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Section */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Search</h2>

                            {/* Text Search */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search by Description
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                                            placeholder="e.g., red t-shirt"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        <button
                                            onClick={handleTextSearch}
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            <MagnifyingGlassIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Image Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search by Image
                                    </label>
                                    <label className="block">
                                        <div className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                            <PhotoIcon className="h-5 w-5 text-gray-600 mr-2" />
                                            <span className="text-sm text-gray-700">Upload to search</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSearch}
                                                disabled={loading}
                                                className="hidden"
                                            />
                                        </div>
                                    </label>
                                </div>

                                {searchMode !== 'none' && (
                                    <button
                                        onClick={() => {
                                            setSearchMode('none');
                                            setSearchResults([]);
                                            setSearchQuery('');
                                        }}
                                        className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Items Grid */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {searchMode !== 'none' ? 'Search Results' : 'Your Items'}
                                </h2>
                                <span className="text-sm text-gray-600">
                                    {displayedItems.length} items
                                </span>
                            </div>

                            {loading && (
                                <div className="text-center py-12 text-gray-600">
                                    Loading...
                                </div>
                            )}

                            {!loading && displayedItems.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    {searchMode !== 'none'
                                        ? 'No matching items found'
                                        : 'No items yet. Upload your first clothing item!'}
                                </div>
                            )}

                            {!loading && displayedItems.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {displayedItems.map((item, index) => (
                                        <div
                                            key={item.item_id || index}
                                            className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                                        >
                                            <div className="aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                                                <PhotoIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm text-gray-900">
                                                    {item.metadata?.category || item.category || 'Item'}
                                                </p>
                                                {(item.metadata?.color || item.color) && (
                                                    <p className="text-xs text-gray-600">
                                                        {item.metadata?.color || item.color}
                                                    </p>
                                                )}
                                                {(item.metadata?.style || item.style) && (
                                                    <p className="text-xs text-gray-500">
                                                        {item.metadata?.style || item.style}
                                                    </p>
                                                )}
                                                {item.similarity_score && (
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        Match: {(item.similarity_score * 100).toFixed(1)}%
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
