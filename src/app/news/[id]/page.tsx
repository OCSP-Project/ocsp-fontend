import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsById } from "@/lib/api/news";
import type { News } from "@/types/news";
import type { Metadata } from "next";

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const news = await getNewsById(params.id);
    if (!news) return {};

    const description = news.contentNews.substring(0, 160);
    const imageUrl = news.imageLinks[0] || "/default-news-image.jpg";

    return {
      title: `${news.title} | OCSP Construction`,
      description,
      keywords: news.tags?.split(",").map((t) => t.trim()) || [],
      authors: [{ name: news.author }],
      openGraph: {
        title: news.title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: news.title,
          },
        ],
        type: "article",
        publishedTime: news.publishedAt || news.createdAt,
        authors: [news.author],
        siteName: "OCSP Construction",
      },
      twitter: {
        card: "summary_large_image",
        title: news.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: news.originalLink || `https://ocsp-tech-web.site/news/${params.id}`,
      },
    };
  } catch (error) {
    return {};
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let news: News | null = null;

  try {
    news = await getNewsById(params.id);
  } catch (error) {
    notFound();
  }

  if (!news) {
    notFound();
  }

  // Structured Data (JSON-LD) for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    image: news.imageLinks,
    datePublished: news.publishedAt || news.createdAt,
    dateModified: news.updatedAt || news.publishedAt || news.createdAt,
    author: {
      "@type": "Person",
      name: news.author,
    },
    publisher: {
      "@type": "Organization",
      name: "OCSP Construction",
      logo: {
        "@type": "ImageObject",
        url: "https://ocsp-tech-web.site/logo.png",
      },
    },
    description: news.contentNews.substring(0, 160),
    articleBody: news.contentNews,
    ...(news.originalLink && {
      isBasedOn: news.originalLink,
      creditText: "VietnamNet",
    }),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="news-detail-page">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white"
          style={{ marginTop: "-80px", paddingTop: "80px" }}
        >
          <div className="container mx-auto px-6 py-8">
            <Link
              href="/news"
              className="inline-flex items-center text-blue-100 hover:text-white mb-4"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại danh sách
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <article className="max-w-4xl mx-auto">
            {/* Title & Meta */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {news.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{news.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {new Date(
                      news.publishedAt || news.createdAt
                    ).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{news.viewCount} lượt xem</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {news.imageLinks.length > 0 && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={news.imageLinks[0]}
                  alt={news.title}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {news.contentNews.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Additional Images */}
            {news.imageLinks.length > 1 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.imageLinks.slice(1).map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${news.title} - Hình ${index + 2}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Original Source - IMPORTANT for SEO */}
            {news.originalLink && (
              <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Bài viết gốc:</strong>{" "}
                  <a
                    href={news.originalLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-blue-600 hover:underline"
                  >
                    {news.originalLink}
                  </a>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Nội dung được chia sẻ từ nguồn bên ngoài với mục đích tham khảo.
                </p>
              </div>
            )}

            {/* Tags */}
            {news.tags && (
              <div className="mt-8">
                <div className="flex flex-wrap gap-2">
                  {news.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
