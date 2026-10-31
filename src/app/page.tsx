import { db } from "@/lib/db";
import { getNextEvent } from "@/lib/events";
import { Header } from "@/components/public/Header";
import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { TimingsAmenitiesSection, LocationMapSection } from "@/components/public/InfoGridSection";
import { GallerySection } from "@/components/public/GallerySection";
import { Footer } from "@/components/public/Footer";
import { StickyCallBar } from "@/components/public/StickyCallBar";
import { JsonLd } from "@/components/public/JsonLd";
import { GalleryPhoto } from "@/components/public/LightboxModal";

export const revalidate = 60; 

export default async function HomePage() {
  let initialPhotos: GalleryPhoto[] = [];
  let nextEvent = null;

  try {
    nextEvent = await getNextEvent();
  } catch (err) {
    console.error("[Next Event Fetch Error]", err);
  }

  try {
    initialPhotos = await db.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        caption: true,
      },
    });
  } catch (err) {
    console.error("[Gallery Fetch Error]", err);
  }

  return (
    <>
      <JsonLd />
      <Header />
      <main className="flex-1 bg-temple-ivory text-temple-charcoal">
        <HeroSection />
        <AboutSection />
        <TimingsAmenitiesSection nextEvent={nextEvent} />
        <GallerySection initialPhotos={initialPhotos} />
        <LocationMapSection />
      </main>
      <Footer />
      <StickyCallBar />
    </>
  );
}