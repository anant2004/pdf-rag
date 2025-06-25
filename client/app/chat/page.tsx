'use client'

import { FileUploadDemo } from "@/components/FileUpload"
import ChatInterface from "@/components/ChatInterface"

export default function ChatPage() {
    return (
        <div className="flex w-screen min-h-screen">
            <div className="w-[30vw] min-w-[300px] max-w-[500px] bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col">
                <FileUploadDemo />
            </div>
            <div className="w-[70vw] flex-1 bg-neutral-950 p-6 flex flex-col">
                <ChatInterface />
            </div>
        </div>
    )
}