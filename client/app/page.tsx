import Image from "next/image";
import AuthCard from "@/components/AuthCard";
import FileUploadComponent from "@/components/PdfUploadCard";
import { BackgroundBeamsDemo } from "@/components/BackgroundBeams";
import {NavbarDemo} from "@/components/Navbar";
import { GlowingEffectDemo } from "@/components/GlowingEffect";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="">
      <NavbarDemo/>
      <BackgroundBeamsDemo/>
      <GlowingEffectDemo/>
      <Footer/>
    </div>
  );
}
