'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by error.tsx:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', backgroundColor: 'white', color: 'red', zIndex: 9999, position: 'relative' }}>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <pre style={{ color: 'black' }}>{error.stack}</pre>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
