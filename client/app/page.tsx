import Image from "next/image";
import AuthCard from "@/components/AuthCard";
import FileUploadComponent from "@/components/PdfUploadCard";
import { BackgroundBeamsDemo } from "@/components/BackgroundBeams";
import {NavbarDemo} from "@/components/Navbar";
import { GlowingEffectDemo } from "@/components/GlowingEffect";
import { LogoMarquee } from "@/components/LogoMarquee";
import PriceSection from "@/components/PriceSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="">
      <NavbarDemo/>
      <BackgroundBeamsDemo/>
      <GlowingEffectDemo/>
      <div className="mt-4 mb-8 text-3xl md:5xl font-bold text-center">My clients ;)</div>
      <LogoMarquee/>
      <PriceSection/>
      <Footer/>
    </div>
  );
}
