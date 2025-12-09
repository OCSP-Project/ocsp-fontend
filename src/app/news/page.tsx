"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedNews } from "@/lib/api/news";
import type { News } from "@/types/news";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNews();
  }, [page]);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const data = await getPublishedNews(page, 10);
      if (page === 1) {
        setNews(data);
      } else {
        setNews((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
    } catch (error) {
      console.error("Failed to load news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredNews = news.filter((n) => n.isFeatured);
  const regularNews = news.filter((n) => !n.isFeatured);

  return (
    <div className="news-page">
      {/* Header Section */}
      <div
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white"
        style={{ marginTop: "-80px", paddingTop: "80px" }}
      >
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              TIN TỨC XÂY DỰNG
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              Cập nhật tin tức mới nhất về ngành xây dựng, nội thất và bất động sản
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Tin nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {item.imageLinks.length > 0 && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.imageLinks[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span>{item.author}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span>•</span>
                      <span>{item.viewCount} lượt xem</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {item.contentNews.substring(0, 200)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular News */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Tin mới nhất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regularNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="group bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                {item.imageLinks.length > 0 && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.imageLinks[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{item.author}</span>
                    <span>•</span>
                    <span>
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.contentNews.substring(0, 100)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem thêm
            </button>
          </div>
        )}

        {/* No News */}
        {!isLoading && news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có tin tức nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
