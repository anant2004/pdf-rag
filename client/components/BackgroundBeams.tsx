"use client";
import React from "react";
import { BackgroundBeams } from "./ui/background-beams";
import { Sparkles } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { UploadIcon } from "lucide-react";

export function BackgroundBeamsDemo() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden">
      <BackgroundBeams />
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-24 w-full max-w-2xl mx-auto">
        {/* Badge with hover animation */}
        <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-8 transition-all duration-300 transform hover:scale-105 hover:bg-gray-700/70 shadow-lg cursor-pointer">
          <Sparkles className="h-4 w-4 mr-2 animate-pulse group-hover:animate-spin" />
          AI-Powered PDF Intelligence
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 mb-4 font-sans whitespace-nowrap">
          Chat with Your PDF Documents
        </h1>
        <p className="text-lg md:text-2xl text-neutral-300 text-center mb-8 max-w-2xl">
          Transform any PDF into an intelligent conversation. Upload your documents and get instant answers, summaries, and insights powered by advanced AI technology.
        </p>
        <div>
          <button className="relative inline-flex h-12 min-w-[180px] overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-6 py-2 text-lg font-semibold text-white backdrop-blur-3xl">
              Get Started
            </span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-neutral-900 transition-all duration-300 transform hover:scale-105 hover:bg-white shadow-lg cursor-pointer">
            <UploadIcon className="h-4 w-4 mr-2 text-neutral-700 animate-pulse group-hover:animate-spin" />
            Easy PDF Upload
          </div>

          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-neutral-900 transition-all duration-300 transform hover:scale-105 hover:bg-white shadow-lg cursor-pointer">
            <MessageCircle className="h-4 w-4 mr-2 text-neutral-700 animate-pulse group-hover:animate-spin" />
            Natural Conversations
          </div>

          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-neutral-900 transition-all duration-300 transform hover:scale-105 hover:bg-white shadow-lg cursor-pointer">
            <Sparkles className="h-4 w-4 mr-2 text-neutral-700 animate-pulse group-hover:animate-spin" />
            AI-Powered Insights
          </div>
        </div>

      </div>
    </div>
  );
}
