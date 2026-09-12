import { Goals } from "@/components/home/Goals";
import { Hero } from "@/components/home/Hero";
import { Pillars } from "@/components/home/Pillars";
import { ProgramPreview } from "@/components/home/ProgramPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pillars />
      <Goals />
      <ProgramPreview />
    </>
  );
}
