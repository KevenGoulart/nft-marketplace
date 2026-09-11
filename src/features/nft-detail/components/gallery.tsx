import { useState } from "react";
import { Search } from "lucide-react";
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
              "size-[100px] shrink-0 cursor-pointer overflow-hidden rounded-lg border-2",
              index === activeIndex ? "border-primary" : "border-transparent"
            )}
          >
            <img src={image} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>

      <div className="relative flex aspect-square w-full items-center justify-center rounded-md bg-card p-2 sm:size-[444px]">
        <img
          src={activeImage}
          alt={`Imagem de ${title}`}
          className="size-full rounded-3xl object-cover"
          fetchPriority="high"
        />
        <a
          href={activeImage}
          target="_blank"
          rel="noreferrer"
          aria-label="Ver imagem em tamanho real"
          className="absolute -right-[7px] -top-[7px] flex size-[30px] items-center justify-center rounded-full bg-border text-foreground"
        >
          <Search className="size-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}
