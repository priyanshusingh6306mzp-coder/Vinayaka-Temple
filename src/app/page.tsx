import { getNextEvent } from "@/lib/events";
import { getFeaturedImages } from "@/lib/gallery";
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
    const featuredImages = await getFeaturedImages();
    initialPhotos = featuredImages.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      title: img.title,
      caption: img.caption,
      eventTitle: img.event?.title || null,
    }));
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