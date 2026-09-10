import { useState } from "react";
import { cn } from "@/lib/utils";

export function NftGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [prevImages, setPrevImages] = useState(images);
  const [activeIndex, setActiveIndex] = useState(0);
  if (images !== prevImages) {
    setPrevImages(images);
    setActiveIndex(0);
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex gap-4 sm:gap-7">
      <div className="hidden flex-col gap-4 sm:flex">
        {images.map((image, index) => (
          <button
            key={image + index}
            type="button"
            aria-label={`Ver imagem ${index + 1} de ${title}`}
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "size-[100px] shrink-0 overflow-hidden rounded-lg border-2",
              index === activeIndex ? "border-primary" : "border-transparent"
            )}
          >
            <img src={image} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>

      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-card p-2 sm:size-[444px]">
        <img
          src={activeImage}
          alt={`Imagem de ${title}`}
          className="size-full rounded-3xl object-cover"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
