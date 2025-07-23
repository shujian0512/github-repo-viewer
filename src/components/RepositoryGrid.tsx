"use client";

import RepositoryCard from './RepositoryCard';
import { Repository } from "@/types/repository";

interface RepositoryGridProps {
  repositories: Repository[];
}

export default function RepositoryGrid({ repositories }: RepositoryGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
} 