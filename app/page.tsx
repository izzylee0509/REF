"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

  const handleShare = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes("instagram.com")) {
        router.push(`/share?url=${encodeURIComponent(text)}`);
      } else {
        alert("클립보드에 인스타그램 링크가 없어요.\n인스타에서 링크 복사 후 다시 눌러주세요.");
      }
    } catch {
      alert("클립보드 접근 권한이 필요해요.\n브라우저 설정에서 허용해주세요.");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <NameSelector onSelect={setUser} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">EO Reference</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-medium hover:bg-gray-200 transition"
          >
            + 공유
          </button>
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
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-20">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="mb-2">아직 공유된 레퍼런스가 없어요</p>
          <p className="text-sm">인스타에서 링크 복사 후 + 공유를 눌러보세요</p>
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
