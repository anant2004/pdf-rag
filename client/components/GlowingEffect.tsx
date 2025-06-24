"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function GlowingEffectDemo() {
    return (
        <ul className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 w-full max-w-6xl mx-auto p-8">
            <GridItem
                icon={<Box className="h-6 w-6 text-white dark:text-neutral-400" />}
                title="Simple PDF Upload"
                description="Drag and drop any PDF document to get started. Supports documents up to 100MB with advanced processing."
            />
            <GridItem
                icon={<Sparkles className="h-6 w-6 text-white dark:text-neutral-400" />}
                title="AI-Powered Analysis"
                description="Advanced language models analyze your documents to understand context, structure, and meaning."
            />
            <GridItem
                icon={<Lock className="h-6 w-6 text-white dark:text-neutral-400" />}
                title="Natural Conversations"
                description="Ask questions in plain English and get detailed, contextual answers from your PDF content."
            />
            <GridItem
                icon={<Search className="h-6 w-6 text-white dark:text-neutral-400" />}
                title="Smart Search"
                description="Find specific information instantly with semantic search that understands meaning, not just keywords."
            />
            <GridItem
                icon={<Box className="h-6 w-6 text-white dark:text-neutral-400" />}
                title="Document Summaries"
                description="Get comprehensive summaries of long documents, highlighting key points and important insights."
            />
            <GridItem
                icon={<Sparkles className="h-6 w-6 text-white dark:text-neutral-400" />}
                title="Lightning Fast"
                description="Get answers in seconds with our optimized AI pipeline and efficient document processing."
            />
        </ul>
    );
}

interface GridItemProps {
    area?: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={`min-h-[14rem] list-none ${area}`}>
            <div className="relative h-full rounded-2xl p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                    blur={0}
                    borderWidth={2}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border border-gray-600 p-2">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                                {title}
                            </h3>
                            <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
