'use client';

import Link from 'next/link';
import { SparklesIcon, CameraIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🧥 AI Outfit Simulator & Recommender
          </h1>
          <p className="mt-2 text-gray-600">
            Your personal AI fashion stylist powered by Gemini, CLIP, and Stable Diffusion
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Transform Your Wardrobe with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload clothing items, get AI-powered outfit recommendations, and visualize
            how they look on you with cutting-edge generative AI technology.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Virtual Wardrobe */}
          <Link href="/wardrobe">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Virtual Wardrobe
              </h3>
              <p className="text-gray-600 mb-4">
                Upload and organize your clothing items. Use CLIP AI to search for
                similar items and compatible pieces.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Upload clothing images</li>
                <li>• AI-powered similarity search</li>
                <li>• Smart categorization</li>
              </ul>
            </div>
          </Link>

          {/* Outfit Recommender */}
          <Link href="/recommend">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI Recommender
              </h3>
              <p className="text-gray-600 mb-4">
                Get personalized outfit suggestions from Gemini AI based on occasion,
                weather, and your style preferences.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Smart outfit combinations</li>
                <li>• Context-aware suggestions</li>
                <li>• Style reasoning & tips</li>
              </ul>
            </div>
          </Link>

          {/* Virtual Try-On */}
          <Link href="/try-on">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-500">
              <div className="flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <CameraIcon className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Virtual Try-On
              </h3>
              <p className="text-gray-600 mb-4">
                Visualize how outfits look on you using Stable Diffusion's powerful
                image generation capabilities.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Realistic try-on simulation</li>
                <li>• Multiple generation modes</li>
                <li>• Instant previews</li>
              </ul>
            </div>
          </Link>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload Your Wardrobe</h4>
              <p className="text-gray-600 text-sm">
                Add your clothing items to build your virtual wardrobe
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get AI Recommendations</h4>
              <p className="text-gray-600 text-sm">
                Describe your needs and let Gemini suggest perfect outfits
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Visualize & Try On</h4>
              <p className="text-gray-600 text-sm">
                See how outfits look with AI-generated try-on simulations
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Powered by cutting-edge AI:</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <span className="px-4 py-2 bg-white rounded-full shadow text-sm font-medium text-gray-700">
              Gemini AI
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow text-sm font-medium text-gray-700">
              OpenAI CLIP
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow text-sm font-medium text-gray-700">
              Stable Diffusion
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow text-sm font-medium text-gray-700">
              Next.js
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow text-sm font-medium text-gray-700">
              FastAPI
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>AI Outfit Simulator & Recommender - Your Personal Fashion AI Assistant</p>
        </div>
      </footer>
    </div>
  );
}

