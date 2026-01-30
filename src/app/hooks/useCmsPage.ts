import { useState, useEffect } from 'react';

export function useCmsPage<T>(pageName: string, defaultContent: T): { content: T; loading: boolean } {
  const [content, setContent] = useState<T>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages?name=${pageName}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContent(data.data);
        }
      })
      .catch((err) => {
        console.error(`Failed to load CMS content for ${pageName}:`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageName]);

  return { content, loading };
}
