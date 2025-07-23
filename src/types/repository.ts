export interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export interface ApiResponse {
  repositories: Repository[];
  count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
} 