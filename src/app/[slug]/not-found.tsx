import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="container mx-auto px-8 sm:px-20 lg:px-40 xl:px-56 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-700">Article not found</h1>
      <p className="text-gray-500 mt-4">
        The article you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
