"use client";

export default function ArchitectureInfo() {
  return (
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
  );
} 