"use client";

import { Repository } from "@/types/repository";

interface RepositoryCardProps {
  repository: Repository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-blue-600 mb-2">
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {repository.name}
        </a>
      </h3>
      {repository.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {repository.description}
        </p>
      )}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-3">
          {repository.language && (
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {repository.language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center">
            ⭐ {repository.stargazers_count}
          </span>
          <span className="flex items-center">
            🍴 {repository.forks_count}
          </span>
        </div>
      </div>
    </div>
  );
} 