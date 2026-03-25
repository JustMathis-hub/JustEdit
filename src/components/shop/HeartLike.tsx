'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';

interface HeartLikeProps {
  productId: string;
  initialLikeCount: number;
  initialLiked?: boolean;
}

export function HeartLike({ productId, initialLikeCount, initialLiked = false }: HeartLikeProps) {
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikeCount);
  const [animating, setAnimating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setUserId(user?.id ?? null);

        if (user) {
          // Check if user already liked this product
          const { data } = await supabase
            .from('product_likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();

          setLiked(!!data);
        }
      } catch {
        // ignore
      }
    };

    checkAuth();
  }, [productId]);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    // Prevent card navigation
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!userId) {
      router.push('/auth/connexion' as any);
      return;
    }

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    setLiked(!wasLiked);
    setCount(wasLiked ? prevCount - 1 : prevCount + 1);

    // Trigger animation on like
    if (!wasLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('product_likes')
          .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
      }
    } catch {
      // Rollback on error
      setLiked(wasLiked);
      setCount(prevCount);
    }
  }, [liked, count, userId, productId, supabase, router]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`je-heart-btn ${liked ? 'je-heart-liked' : ''} ${animating ? 'je-heart-pop' : ''}`}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {/* Burst particles */}
      <span className="je-heart-burst" />

      {/* Heart SVG */}
      <svg
        className={`je-heart-icon ${liked ? 'je-heart-icon--filled' : 'je-heart-icon--empty'}`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>

      {/* Like count */}
      <span className="je-heart-count">{count}</span>
    </button>
  );
}
