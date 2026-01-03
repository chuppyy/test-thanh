import { VARIABLES } from "@/constant/variables";
import { Article, NewsGroup } from "@/types/article";
import { extractIdFromSlug } from "@/utils/data";
import { fetchWithRetry } from "@/utils/fetch-helper";
import { unstable_cache } from "next/cache";

type ArticleResponse = {
  data: Article[];
};

/**
 * Fetch articles from origin API
 */
export const fetchArticlesFromAPI = async (id: string): Promise<Article[]> => {
  try {
    const response = await fetchWithRetry(
      `${
        VARIABLES.nextPublicAppApi
      }/News/news-detailvip?id=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
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
      // Cache for 100 hours - long cache for article details
      revalidate: 360000,
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

/**
 * Get a new list of article
 */
export const getNewsList = async (): Promise<NewsGroup[]> => {
  try {
    const response = await fetch(`${VARIABLES.appApi2}/News/news-list`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
