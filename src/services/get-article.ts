import { Article } from "@/types/article";
import { extractIdFromSlug } from "@/utils/data";
import { unstable_cache } from "next/cache";

type ArticleResponse = {
  data: Article[];
};

/**
 * Fetch articles from origin API
 */
export const fetchArticlesFromAPI = async (id: string): Promise<Article[]> => {
  try {
    const response = await fetch(
      `https://apisport.vbonews.com/News/news-detailvip?id=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: ArticleResponse = await response.json();

    return Array.isArray(data.data) ? data.data : [data.data];
  } catch (error) {
    console.error(`Failed to fetch articles ${id}:`, error);
    return [];
  }
};

/**
 * Get article with cache operation
 */
export const getArticles = async (slug: string): Promise<Article[]> => {
  const id = extractIdFromSlug(slug);
  if (!id) return [];

  const getCachedArticles = unstable_cache(
    async () => {
      const articles = await fetchArticlesFromAPI(id);
      if (!articles || articles.length === 0) {
        throw new Error(`Articles ${id} not found or API error`);
      }
      return articles;
    },
    [`articles-${id}`],
    {
      revalidate: 600,
      tags: [`articles-${id}`],
    }
  );

  try {
    return await getCachedArticles();
  } catch (error) {
    console.error(`Error getting articles ${id}:`, error);
    return [];
  }
};
