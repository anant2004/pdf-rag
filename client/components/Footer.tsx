import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-12 px-4 md:px-16 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Left: Logo and Description */}
        <div className="flex-1 flex flex-col gap-4 min-w-[260px]">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-lg">
              <FileText className="w-7 h-7 text-[#10151F]" />
            </span>
            <span className="text-2xl font-bold text-white">PDFChat AI</span>
          </div>
          <p className="text-base text-neutral-300 max-w-md">
            Transform your PDF documents into interactive conversations with the power of AI. Get instant answers, insights, and summaries from any document.
          </p>
          <span className="text-xs text-neutral-500 mt-2">© 2024 PDFChat AI. All rights reserved.</span>
        </div>
        {/* Center: Product Links */}
        <div className="flex-1 flex flex-col gap-2 min-w-[160px]">
          <span className="font-semibold text-lg mb-2">Product</span>
          <a href="#" className="text-neutral-300 hover:text-white transition">Features</a>
          <a href="#" className="text-neutral-300 hover:text-white transition">Pricing</a>
          <a href="#" className="text-neutral-300 hover:text-white transition">API</a>
          <a href="#" className="text-neutral-300 hover:text-white transition">Integrations</a>
        </div>
        {/* Right: Support Links */}
        <div className="flex-1 flex flex-col gap-2 min-w-[160px]">
          <span className="font-semibold text-lg mb-2">Support</span>
          <a href="#" className="text-neutral-300 hover:text-white transition">Help Center</a>
          <a href="#" className="text-neutral-300 hover:text-white transition">Contact Us</a>
          <a href="#" className="text-neutral-300 hover:text-white transition">Privacy Policy</a>
          <a href="#" className="text-neutral-300 hover:text-white transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
