'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { diffusionApi } from '@/lib/api';

export default function TryOnPage() {
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [personPreview, setPersonPreview] = useState<string>('');
    const [clothingPreview, setClothingPreview] = useState<string>('');
    const [resultImage, setResultImage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'img2img' | 'simple'>('simple');

    // Parameters
    const [prompt, setPrompt] = useState('person wearing stylish casual outfit, high quality photo');
    const [strength, setStrength] = useState(0.7);
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [steps, setSteps] = useState(30);

    const handlePersonImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPersonImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPersonPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClothingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setClothingImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setClothingPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!personImage) {
            alert('Please upload a person image');
            return;
        }

        setLoading(true);
        setResultImage('');

        try {
            let imageUrl: string;

            if (mode === 'simple') {
                imageUrl = await diffusionApi.tryOnSimple(personImage, prompt, {
                    strength,
                    guidance_scale: guidanceScale,
                    num_inference_steps: steps,
                });
            } else {
                if (!clothingImage) {
                    alert('Please upload a clothing image for img2img mode');
                    setLoading(false);
                    return;
                }
                imageUrl = await diffusionApi.tryOnImg2Img(personImage, clothingImage, {
                    prompt,
                    strength,
                    guidance_scale: guidanceScale,
                    num_inference_steps: steps,
                });
            }

            setResultImage(imageUrl);
        } catch (error) {
            console.error('Error generating try-on:', error);
            alert('Failed to generate try-on. Make sure the Diffusion service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateOutfitOnly = async () => {
        setLoading(true);
        setResultImage('');

        try {
            const imageUrl = await diffusionApi.generateOutfit(prompt, {
                guidance_scale: guidanceScale,
                num_inference_steps: steps,
            });
            setResultImage(imageUrl);
        } catch (error) {
            console.error('Error generating outfit:', error);
            alert('Failed to generate outfit visualization');
        } finally {
            setLoading(false);
        }
    };

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
                            <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
                            <p className="text-gray-600">Visualize outfits with Stable Diffusion</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Panel - Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Mode Selection */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Mode</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setMode('simple')}
                                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${mode === 'simple'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">Simple Try-On</div>
                                    <div className="text-sm text-gray-600">Text-based generation</div>
                                </button>
                                <button
                                    onClick={() => setMode('img2img')}
                                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${mode === 'img2img'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">Image-to-Image</div>
                                    <div className="text-sm text-gray-600">Use clothing image</div>
                                </button>
                            </div>
                        </div>

                        {/* Image Uploads */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Images</h2>

                            <div className="space-y-4">
                                {/* Person Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Person Image *
                                    </label>
                                    <label className="block cursor-pointer">
                                        {personPreview ? (
                                            <img
                                                src={personPreview}
                                                alt="Person preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                                                <div className="text-center">
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-600">Upload person image</p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePersonImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* Clothing Image (only in img2img mode) */}
                                {mode === 'img2img' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Clothing Image
                                        </label>
                                        <label className="block cursor-pointer">
                                            {clothingPreview ? (
                                                <img
                                                    src={clothingPreview}
                                                    alt="Clothing preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                                                    <div className="text-center">
                                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-600">Upload clothing</p>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleClothingImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Parameters */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Parameters</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prompt
                                    </label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Describe the outfit..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Strength: {strength.toFixed(2)}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={strength}
                                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Higher = more transformation
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Guidance Scale: {guidanceScale.toFixed(1)}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        step="0.5"
                                        value={guidanceScale}
                                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Higher = follows prompt more closely
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Steps: {steps}
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={steps}
                                        onChange={(e) => setSteps(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        More steps = better quality (slower)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Generate Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !personImage}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <SparklesIcon className="h-5 w-5 animate-pulse" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-5 w-5" />
                                        Generate Try-On
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleGenerateOutfitOnly}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                            >
                                Generate Outfit Visualization Only
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Result */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Result</h2>

                            {!resultImage && !loading && (
                                <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
                                    <div className="text-center text-gray-500">
                                        <PhotoIcon className="mx-auto h-24 w-24 text-gray-300 mb-4" />
                                        <p className="text-lg">Your generated try-on will appear here</p>
                                        <p className="text-sm mt-2">
                                            Upload a person image and click "Generate Try-On"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
                                    <div className="text-center">
                                        <SparklesIcon className="mx-auto h-24 w-24 text-blue-500 animate-pulse mb-4" />
                                        <p className="text-lg text-gray-700 font-semibold">Generating your try-on...</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            This may take 30-60 seconds
                                        </p>
                                    </div>
                                </div>
                            )}

                            {resultImage && !loading && (
                                <div className="space-y-4">
                                    <img
                                        src={resultImage}
                                        alt="Generated try-on"
                                        className="w-full rounded-lg"
                                    />
                                    <div className="flex gap-3">
                                        <a
                                            href={resultImage}
                                            download="try-on-result.png"
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                                        >
                                            Download Image
                                        </a>
                                        <button
                                            onClick={() => setResultImage('')}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
