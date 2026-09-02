import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { SiteContent } from '../types';

let cachedContent: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

export const useSiteContent = () => {
  const [content, setContent] = useState<Record<string, string>>(cachedContent || {});
  const [loading, setLoading] = useState(!cachedContent);

  const fetchContent = () => {
    fetchPromise = supabase
      .from('site_content')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching site content:', error);
          return cachedContent || {};
        }
        const contentMap: Record<string, string> = {};
        data?.forEach((item: SiteContent) => {
          contentMap[item.key] = item.value;
        });
        cachedContent = contentMap;
        return contentMap;
      }) as Promise<Record<string, string>>;

    return fetchPromise.then((contentMap) => {
      setContent(contentMap);
      setLoading(false);
      return contentMap;
    });
  };

  useEffect(() => {
    if (cachedContent) {
      setContent(cachedContent);
      setLoading(false);
      return;
    }
    fetchContent();
  }, []);

  // Helper function to safely get content or provide a fallback
  const get = (key: string, fallback: string = '') => {
    return content[key] !== undefined && content[key] !== '' ? content[key] : fallback;
  };

  // Update a single key in DB and cache
  const updateContent = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      
      if (error) {
        console.warn(`[useSiteContent] Supabase upsert notice for ${key}:`, error.message);
      }
      
      cachedContent = { ...(cachedContent || {}), [key]: value };
      setContent(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (err) {
      console.error('Failed to save site content:', err);
      cachedContent = { ...(cachedContent || {}), [key]: value };
      setContent(prev => ({ ...prev, [key]: value }));
      return false;
    }
  };

  // Update multiple keys at once
  const updateMultiple = async (itemsMap: Record<string, string>) => {
    const rows = Object.entries(itemsMap).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }));

    try {
      const { error } = await supabase
        .from('site_content')
        .upsert(rows, { onConflict: 'key' });

      if (error) {
        console.warn('[useSiteContent] Supabase bulk upsert notice:', error.message);
      }

      cachedContent = { ...(cachedContent || {}), ...itemsMap };
      setContent(prev => ({ ...prev, ...itemsMap }));
      return true;
    } catch (err) {
      console.error('Failed to bulk save site content:', err);
      cachedContent = { ...(cachedContent || {}), ...itemsMap };
      setContent(prev => ({ ...prev, ...itemsMap }));
      return false;
    }
  };

  return { content, get, loading, updateContent, updateMultiple, refetch: fetchContent };
};
