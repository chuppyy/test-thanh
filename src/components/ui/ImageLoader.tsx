import { Spinner } from "./Spinner";

type ImageLoaderProps = {
  size?: "sm" | "md" | "lg";
};

export const ImageLoader = ({ size = "md" }: ImageLoaderProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <Spinner size={size} />
    </div>
  );
};
