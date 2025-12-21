"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, memo } from "react";
import { ImageLoader } from "@/components/ui";

type NewsCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  priority?: boolean;
};

export const NewsCard = memo(function NewsCard({
  id,
  title,
  imageUrl,
  priority = false,
}: NewsCardProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Truncate title to max 60 characters
  const truncatedTitle = title.length > 60 ? `${title.slice(0, 60)}...` : title;

  return (
    <Link
      href={`/${id}`}
      className="w-full sm:w-[48%] lg:w-[23%] flex flex-col bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 no-underline"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        {(isLoading || hasError) && <ImageLoader size="md" />}
        {!hasError && (
          <Image
            src={imageUrl}
            alt={truncatedTitle}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 23vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            onError={handleError}
            onLoad={handleLoad}
            unoptimized
          />
        )}
      </div>
      <div className="flex flex-col grow p-4">
        <p
          className="text-sm text-gray-800 line-clamp-2 grow mb-3 leading-relaxed"
          title={title}
        >
          {truncatedTitle}
        </p>
        <span className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          Read more →
        </span>
      </div>
    </Link>
  );
});
