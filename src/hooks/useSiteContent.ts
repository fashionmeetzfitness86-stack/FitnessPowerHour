import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { SiteContent } from '../types';

let cachedContent: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

export const useSiteContent = () => {
  const [content, setContent] = useState<Record<string, string>>(cachedContent || {});
  const [loading, setLoading] = useState(!cachedContent);

  useEffect(() => {
    if (cachedContent) {
      setContent(cachedContent);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = supabase
        .from('site_content')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching site content:', error);
            return {};
          }
          const contentMap: Record<string, string> = {};
          data?.forEach((item: SiteContent) => {
            contentMap[item.key] = item.value;
          });
          cachedContent = contentMap;
          return contentMap;
        }) as Promise<Record<string, string>>;
    }

    fetchPromise.then((contentMap) => {
      setContent(contentMap);
      setLoading(false);
    });
  }, []);

  // Helper function to safely get content or provide a fallback
  const get = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  return { content, get, loading };
};
