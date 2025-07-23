import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/types/repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '30';

  // Validate username parameter
  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    );
  }

  // Validate username format (basic validation)
  if (typeof username !== 'string' || username.trim().length === 0) {
    return NextResponse.json(
      { error: 'Invalid username format' },
      { status: 400 }
    );
  }

  // Validate pagination parameters
  const pageNum = parseInt(page, 10);
  const perPageNum = parseInt(perPage, 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json(
      { error: 'Invalid page parameter' },
      { status: 400 }
    );
  }
  
  if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 100) {
    return NextResponse.json(
      { error: 'Invalid per_page parameter (must be 1-100)' },
      { status: 400 }
    );
  }

  try {
    // Call GitHub API with pagination parameters
    const githubUrl = `https://api.github.com/users/${username}/repos?page=${pageNum}&per_page=${perPageNum}`;
    const response = await fetch(githubUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Repo-Viewer-App',
      },
    });

    // Handle different response statuses
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to fetch repositories' },
          { status: response.status }
        );
      }
    }

    const repositories: Repository[] = await response.json();

    // Determine if there are more pages
    // If we got exactly the requested per_page amount, there might be more
    const hasMore = repositories.length === perPageNum;

    // Return the repositories data with pagination info
    return NextResponse.json({
      repositories,
      count: repositories.length,
      page: pageNum,
      per_page: perPageNum,
      has_more: hasMore,
    });

  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 