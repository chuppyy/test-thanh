import { SkeletonLoader } from "@/components/ui";

export default function ArticleLoading() {
  return (
    <div className="container mx-auto px-8 sm:px-20 lg:px-40 xl:px-56 py-10">
      <SkeletonLoader type="article" />
    </div>
  );
}
