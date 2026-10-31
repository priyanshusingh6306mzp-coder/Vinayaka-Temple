import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AlbumCollage } from "@/components/public/AlbumCollage";
import { AlbumPhotoGrid } from "@/components/public/AlbumPhotoGrid";
import { GallerySection } from "@/components/public/GallerySection";

describe("Public Gallery & Accessibility Checks", () => {
  const samplePhotos = [
    {
      id: "photo-1",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/sample_1.jpg",
      title: "Ganesh Chaturthi Utsav",
      caption: "Special morning archana performed with sacred bilva leaves",
      eventTitle: "Ganesh Chaturthi 2026",
    },
    {
      id: "photo-2",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/sample_2.png",
      title: "raw_image_file.jpg", // Filename-style title should be sanitized
      caption: null,
      eventTitle: "Sankashti Chaturthi",
    },
    {
      id: "photo-3",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/sample_3.webp",
      title: "IMG_20261101_102030.JPG", // Another raw filename
      caption: null,
      eventTitle: null,
    },
  ];

  it("ensures rendered AlbumPhotoGrid contains NO <a href> pointing to image files", () => {
    const markup = renderToStaticMarkup(React.createElement(AlbumPhotoGrid, { photos: samplePhotos }));

    // Must not have <a href="...jpg"> or any <a href> around images
    expect(markup).not.toMatch(/<a[^>]+href=["'][^"']*\.(jpe?g|png|webp|gif|avif)/i);
    // Every photo must be rendered with an accessible button
    expect(markup).toContain('type="button"');
  });

  it("ensures rendered AlbumPhotoGrid sanitizes raw filenames from alt text", () => {
    const markup = renderToStaticMarkup(React.createElement(AlbumPhotoGrid, { photos: samplePhotos }));

    // photo-2 has title 'raw_image_file.jpg' but eventTitle 'Sankashti Chaturthi' -> alt should use eventTitle
    expect(markup).toContain('alt="Sankashti Chaturthi"');
    expect(markup).not.toContain('alt="raw_image_file.jpg"');

    // photo-3 has no caption or eventTitle, and title is a filename -> fallback should be used
    expect(markup).toContain('alt="Photograph from Shri Vinayaka Temple"');
    expect(markup).not.toContain('alt="IMG_20261101_102030.JPG"');
  });

  it("ensures rendered GallerySection contains NO <a href> pointing to image files", () => {
    const markup = renderToStaticMarkup(React.createElement(GallerySection, { initialPhotos: samplePhotos }));

    expect(markup).not.toMatch(/<a[^>]+href=["'][^"']*\.(jpe?g|png|webp|gif|avif)/i);
    expect(markup).toContain('type="button"');
    expect(markup).toContain('View all photos');
  });

  it("ensures AlbumCollage renders appropriate layout for 1, 2, 3, and 4 images without raw filenames in alt", () => {
    const photoWithFilename = {
      id: "p1",
      imageUrl: "https://cdn.example.com/p1.webp",
      title: "DSC_0001.JPG",
      caption: null,
    };

    const markup1 = renderToStaticMarkup(
      React.createElement(AlbumCollage, { images: [photoWithFilename], title: "Diwali Celebration" })
    );
    expect(markup1).toContain('alt="Photo from Diwali Celebration"');
    expect(markup1).not.toContain('alt="DSC_0001.JPG"');

    const markup4 = renderToStaticMarkup(
      React.createElement(AlbumCollage, {
        images: [
          photoWithFilename,
          { id: "p2", imageUrl: "https://cdn.example.com/p2.webp", title: "Ritual 2", caption: "Aarti" },
          { id: "p3", imageUrl: "https://cdn.example.com/p3.webp", title: "Ritual 3", caption: "Prasadam" },
          { id: "p4", imageUrl: "https://cdn.example.com/p4.webp", title: "Ritual 4", caption: null },
        ],
        title: "Navratri Utsav",
      })
    );
    expect(markup4).toContain('grid-cols-2 grid-rows-2');
    expect(markup4).toContain('alt="Aarti"');
    expect(markup4).toContain('alt="Prasadam"');
  });
});
