import { Spinner } from "./Spinner";

type PageLoaderProps = {
  text?: string;
};

export const PageLoader = ({ text = "Loading..." }: PageLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 text-lg">{text}</p>
    </div>
  );
};
