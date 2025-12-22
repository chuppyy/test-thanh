import React from "react";
import { BannerCard, NewsCard } from "@/components/cards";
import { getNewsList } from "@/services/get-article";
import { NewsGroup, NewsItem } from "@/types/article";

const bannerImages = [
  { src: "/hinh0.png", alt: "Banner 0", size: "large" as const },
  { src: "/hinh1.png", alt: "Banner 1" },
  { src: "/hinh2.png", alt: "Banner 2" },
  { src: "/hinh3.png", alt: "Banner 3" },
  { src: "/hinh4.png", alt: "Banner 4" },
];

export default async function HomePage() {
  const data = await getNewsList();

  return (
    <div className="container mx-auto">
      {/* Banner Section */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 sm:px-12">
        {/* Large Banner */}
        <div className="flex-1">
          <BannerCard
            src={bannerImages[0].src}
            alt={bannerImages[0].alt}
            size="large"
            priority
          />
        </div>
        {/* Small Banners Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {bannerImages.slice(1).map((banner, idx) => (
            <BannerCard
              key={idx}
              src={banner.src}
              alt={banner.alt}
              priority={idx < 2}
            />
          ))}
        </div>
      </div>

      {/* News Section */}
      <div className="pt-12">
        {data.map((group: NewsGroup, index: number) => (
          <React.Fragment key={index}>
            <h1 className="m-0 bg-[#fbf8f5] px-4 sm:px-24 py-4 text-xl font-bold">
              {group.groupName}
            </h1>
            <div className="flex flex-wrap gap-3 bg-[#fbf8f5] px-4 sm:px-24 py-4 mb-12">
              {group.detail.map((item: NewsItem, idx: number) => (
                <NewsCard
                  key={idx}
                  id={item.id}
                  title={item.name}
                  imageUrl={item.avatarLink}
                  priority={index === 0 && idx < 4}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
