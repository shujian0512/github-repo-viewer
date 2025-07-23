"use client";

import { useState, useEffect } from "react";

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

interface ApiResponse {
  repositories: Repository[];
  count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

interface ApiError {
  error: string;
}

type SortOption = 'stars' | 'forks' | 'none';

export default function Home() {
  const [username, setUsername] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [githubApiPage, setGithubApiPage] = useState(1);
  const [hasMoreRepositories, setHasMoreRepositories] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const itemsPerPage = 9;

  // Reset pagination when repositories change
  useEffect(() => {
    setCurrentPage(1);
  }, [repositories]);

  // Sort repositories based on current sort option
  const sortedRepositories = [...repositories].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'forks':
        return b.forks_count - a.forks_count;
      default:
        return 0; // Keep original order
    }
  });

  // Calculate pagination using sorted repositories
  const totalPages = Math.ceil(sortedRepositories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRepositories = sortedRepositories.slice(startIndex, endIndex);
  const isLastPage = currentPage === totalPages;

  const fetchRepositories = async (resetList = true) => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    
    if (resetList) {
      setRepositories([]);
      setGithubApiPage(1);
      setSortBy('none'); // Reset sort when fetching new user
    }

    try {
      // Call our internal API route with GitHub pagination
      const response = await fetch(`/api/github?username=${encodeURIComponent(username)}&page=1&per_page=30`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || "Error fetching data");
      }

      const data: ApiResponse = await response.json();
      setRepositories(data.repositories);
      setGithubApiPage(1);
      setHasMoreRepositories(data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching data");
      setRepositories([]);
      setHasMoreRepositories(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRepositories = async () => {
    if (!username.trim() || !hasMoreRepositories) return;

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = githubApiPage + 1;
      const response = await fetch(`/api/github?username=${encodeURIComponent(username)}&page=${nextPage}&per_page=30`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || "Error loading more repositories");
      }

      const data: ApiResponse = await response.json();
      
      // Append new repositories to existing list
      setRepositories(prevRepos => [...prevRepos, ...data.repositories]);
      setGithubApiPage(nextPage);
      setHasMoreRepositories(data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading more repositories");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepositories(true);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of repositories section
    const reposSection = document.getElementById('repositories-section');
    if (reposSection) {
      reposSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end page numbers
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust start page if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Add pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GitHub Repository Viewer
          </h1>
          <p className="text-gray-600">
            Enter a GitHub username to view their public repositories
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Fetch Repos"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading repositories...</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {repositories.length > 0 && (
          <div id="repositories-section" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Repositories ({repositories.length})
                  {hasMoreRepositories && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      (More available)
                    </span>
                  )}
                </h2>
                {totalPages > 1 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedRepositories.length)} of {sortedRepositories.length}
                  </div>
                )}
              </div>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => handleSortChange('none')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      sortBy === 'none'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => handleSortChange('stars')}
                    className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                      sortBy === 'stars'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ⭐ Stars
                  </button>
                  <button
                    onClick={() => handleSortChange('forks')}
                    className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                      sortBy === 'forks'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🍴 Forks
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {repo.name}
                    </a>
                  </h3>
                  {repo.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      {repo.language && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span className="flex items-center">
                        🍴 {repo.forks_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button - Show on last page if more repositories are available */}
            {isLastPage && hasMoreRepositories && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreRepositories}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      Load More Repositories
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to load the next 30 repositories
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium border ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && repositories.length === 0 && username && (
          <div className="text-center py-8 text-gray-500">
            No repositories found or user has no public repositories.
          </div>
        )}

        {/* Architecture Information */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🏗️ Application Architecture
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Frontend:</strong> Calls internal API at <code className="bg-gray-100 px-1 rounded">/api/github</code></p>
            <p><strong>Backend API Route:</strong> Handles GitHub API calls server-side with pagination support</p>
            <p><strong>UI Pagination:</strong> 9 repositories per page with navigation controls</p>
            <p><strong>GitHub API Pagination:</strong> Loads 30 repositories per request with &quot;Load More&quot; functionality</p>
            <p><strong>Sorting:</strong> Client-side sorting by stars, forks, or default order</p>
            <p><strong>Benefits:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Efficient loading of large repository lists</li>
              <li>Seamless user experience with progressive loading</li>
              <li>Flexible sorting options for repository analysis</li>
              <li>API keys can be securely stored server-side</li>
              <li>Rate limiting management in one place</li>
              <li>Error handling and data transformation centralized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
