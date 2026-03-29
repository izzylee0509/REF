"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import NameSelector from "@/components/NameSelector";

type Post = {
  id: string;
  instagram_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  shared_by: string;
  comment: string | null;
  created_at: string;
  comment_count?: number;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, comments(count)")
      .order("created_at", { ascending: false });

    if (data) {
      const mapped = data.map((p: any) => ({
        ...p,
        comment_count: p.comments?.[0]?.count ?? 0,
      }));
      setPosts(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <NameSelector onSelect={setUser} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">EO Reference</h1>
        {user && (
          <button
            onClick={() => {
              localStorage.removeItem("eo_user");
              setUser(null);
            }}
            className="text-xs text-zinc-500 hover:text-white transition"
          >
            {user} ▾
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-20">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="mb-2">아직 공유된 레퍼런스가 없어요</p>
          <p className="text-sm">인스타그램에서 단축어로 공유해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
