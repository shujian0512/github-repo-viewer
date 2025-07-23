"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import RepositoryHeader from "@/components/RepositoryHeader";
import RepositoryGrid from "@/components/RepositoryGrid";
import LoadMoreButton from "@/components/LoadMoreButton";
import PaginationControls from "@/components/PaginationControls";
import ArchitectureInfo from "@/components/ArchitectureInfo";
import { SortOption } from "@/components/SortControls";
import { Repository, ApiResponse, ApiError } from "@/types/repository";

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

        <SearchForm
          username={username}
          setUsername={setUsername}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {loading && <LoadingSpinner />}

        {error && <ErrorMessage error={error} />}

        {repositories.length > 0 && (
          <div id="repositories-section" className="space-y-6">
            <RepositoryHeader
              repositoryCount={repositories.length}
              hasMoreRepositories={hasMoreRepositories}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              sortedRepositoriesLength={sortedRepositories.length}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            <RepositoryGrid repositories={currentRepositories} />

            {/* Load More Button - Show on last page if more repositories are available */}
            {isLastPage && hasMoreRepositories && (
              <LoadMoreButton
                onClick={loadMoreRepositories}
                loading={loadingMore}
              />
            )}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
            />
          </div>
        )}

        {!loading && !error && repositories.length === 0 && username && (
          <div className="text-center py-8 text-gray-500">
            No repositories found or user has no public repositories.
          </div>
        )}

        <ArchitectureInfo />
      </div>
    </div>
  );
}
