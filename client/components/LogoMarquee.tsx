import { Marquee } from "@/components/ui/marquee";
import {siGoogle, siApple, siSpotify, siOnlyfans, siMeta, siX} from 'simple-icons';

const logos = [
  siGoogle,
  siApple,
  siMeta,
  siOnlyfans,
  siSpotify,
  siX
];

const firstRow = logos.slice(0, logos.length / 2);
const secondRow = logos.slice(logos.length / 2);

const CompanyLogo = ({ svg, title }: { svg: string; title: string }) => {
  return (
    <div
      className="flex items-center justify-center h-20 w-32 p-4 opacity-80 hover:opacity-100 transition"
      title={title}
    >
      <div
        className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

export function LogoMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:12s]">
        {firstRow.map((logo, idx) => (
          <CompanyLogo key={idx} svg={logo.svg} title={logo.title} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:12s]">
        {secondRow.map((logo, idx) => (
          <CompanyLogo key={idx} svg={logo.svg} title={logo.title} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
    </div>
  );
}