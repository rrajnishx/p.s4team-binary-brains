"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Frontend Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg-primary text-text-primary p-6">
      <div className="bg-bg-secondary p-8 rounded-xl border border-border-color/50 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-accent-red mb-4">Something went wrong!</h2>
        <p className="text-text-secondary mb-6">
          The app encountered an unexpected error but recovered gracefully using fallback data where possible.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
