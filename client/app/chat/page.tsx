'use client';

import { FileUploadDemo } from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen">
            {/* Sidebar */}
            <div className="w-full md:w-[30vw] min-w-[300px] max-w-[500px] bg-[#0A0A0A] border-r border-neutral-900 p-6 flex flex-col rounded-xl md:h-screen">
                <FileUploadDemo />
            </div>

            {/* Chat area */}
            <div className="w-full md:w-[70vw] flex-1 p-6 flex flex-col md:h-screen">
                <ChatInterface />
            </div>
        </div>
    );
}
