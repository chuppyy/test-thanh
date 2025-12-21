"use client";

import Image from "next/image";
import { useState, memo } from "react";
import { Spinner } from "@/components/ui";

type BannerCardProps = {
  src: string;
  alt: string;
  priority?: boolean;
  size?: "large" | "small";
};

export const BannerCard = memo(function BannerCard({
  src,
  alt,
  priority = false,
  size = "small",
}: BannerCardProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const sizeClasses =
    size === "large" ? "aspect-[5/3] sm:aspect-auto sm:h-full" : "aspect-[5/3]";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-gray-100 ${sizeClasses}`}
    >
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={
            size === "large"
              ? "(max-width: 640px) 100vw, 50vw"
              : "(max-width: 640px) 50vw, 25vw"
          }
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onError={handleError}
          fetchPriority={priority ? "high" : "auto"}
        />
      )}
    </div>
  );
});
