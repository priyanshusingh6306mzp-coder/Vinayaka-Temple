import { getNextEvent, getTodayEvents } from "@/lib/events";
import { getFeaturedImages } from "@/lib/gallery";
import { getDarshanTimings } from "@/lib/darshan-timings";
import { getKolkataDateString } from "@/lib/date-utils";
import { Header } from "@/components/public/Header";
import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { TimingsAmenitiesSection, LocationMapSection } from "@/components/public/InfoGridSection";
import { GallerySection } from "@/components/public/GallerySection";
import { Footer } from "@/components/public/Footer";
import { StickyCallBar } from "@/components/public/StickyCallBar";
import { JsonLd } from "@/components/public/JsonLd";
import { GalleryPhoto } from "@/components/public/LightboxModal";
import type { TodayEventItem } from "@/components/public/TodayEventCard";

export const revalidate = 60; 

export default async function HomePage() {
  let initialPhotos: GalleryPhoto[] = [];
  let nextEvent = null;
  let todayEvents: TodayEventItem[] = [];
  const serverDateStr = getKolkataDateString(new Date());
  const timings = await getDarshanTimings();

  try {
    const rawToday = await getTodayEvents();
    todayEvents = rawToday.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      eventDate: getKolkataDateString(e.eventDate),
      startTime: e.startTime,
      description: e.description,
    }));
  } catch (err) {
    console.error("[Today Events Fetch Error]", err);
  }

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
      <JsonLd timings={timings} />
      <Header />
      <main className="flex-1 bg-temple-ivory text-temple-charcoal">
        <HeroSection timings={timings} todayEvents={todayEvents} serverDateStr={serverDateStr} />
        <AboutSection />
        <TimingsAmenitiesSection nextEvent={nextEvent} timings={timings} />
        <GallerySection initialPhotos={initialPhotos} />
        <LocationMapSection />
      </main>
      <Footer timings={timings} />
      <StickyCallBar />
    </>
  );
}
