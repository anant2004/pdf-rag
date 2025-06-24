import Image from "next/image";
import AuthCard from "@/components/AuthCard";
import FileUploadComponent from "@/components/PdfUploadCard";
import { BackgroundBeamsDemo } from "@/components/BackgroundBeams";
import {NavbarDemo} from "@/components/Navbar";
import { TailwindcssButtons } from "@/components/TailwindCSSButton";

export default function Home() {
  return (
    <div className="">
      <NavbarDemo/>
      <BackgroundBeamsDemo/>
      <TailwindcssButtons/>
    </div>
  );
}
