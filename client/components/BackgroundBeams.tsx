"use client";
import React from "react";
import { BackgroundBeams } from "./ui/background-beams";
import { Sparkles, MessageCircle, UploadIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function BackgroundBeamsDemo() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    router.push(isSignedIn ? "/chat" : "/login");
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden px-4">
      <BackgroundBeams />

      <div className="relative z-10 flex flex-col items-center justify-center py-20 w-full max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-white mb-6 transition-transform hover:scale-105 shadow-md">
          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
          AI-Powered PDF Intelligence
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 mb-4 font-sans">
          Chat with Your PDF Documents
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base md:text-lg text-neutral-300 mb-8">
          Transform any PDF into an intelligent conversation. Upload your documents and get instant answers, summaries, and insights powered by advanced AI.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleClick}
          className="relative inline-flex h-11 min-w-[160px] sm:min-w-[180px] overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl mb-6"
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full items-center justify-center rounded-xl bg-slate-950 px-6 py-2 text-sm sm:text-base font-semibold text-white backdrop-blur-3xl">
            Get Started
          </span>
        </button>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {[
            { icon: UploadIcon, text: "Easy PDF Upload" },
            { icon: MessageCircle, text: "Natural Conversations" },
            { icon: Sparkles, text: "AI-Powered Insights" },
          ].map(({ icon: Icon, text }, idx) => (
            <div
              key={idx}
              className="inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-neutral-900 transition-transform hover:scale-105 shadow-md"
            >
              <Icon className="h-4 w-4 mr-2 text-neutral-700 animate-pulse" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
