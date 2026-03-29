"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  instagram_url: string;
  shared_by: string;
  comment: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  author: string;
  content: string;
  created_at: string;
};

function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // 깔끔한 URL로 정리
  const cleanUrl = url.split("?")[0].replace(/\/$/, "") + "/";

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={cleanUrl}
      data-instgrm-version="14"
      style={{ maxWidth: "100%", width: "100%", margin: "0 auto" }}
    />
  );
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user =
    typeof window !== "undefined" ? localStorage.getItem("eo_user") : null;

  const fetchData = useCallback(async () => {
    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();
    if (postData) setPost(postData);

    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    if (commentData) setComments(commentData);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      post_id: id,
      author: user,
      content: newComment.trim(),
    });
    setNewComment("");
    await fetchData();
    setSubmitting(false);
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500">
        불러오는 중...
      </div>
    );
  }

  const date = new Date(post.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-zinc-400 hover:text-white text-sm mb-6 transition"
      >
        ← 뒤로
      </button>

      {/* 공유자 정보 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">{post.shared_by}</span>
        <span className="text-xs text-zinc-500">{date}</span>
      </div>

      {/* 공유 코멘트 */}
      {post.comment && (
        <p className="text-sm text-zinc-300 bg-zinc-900 rounded-xl px-4 py-3 mb-4">
          {post.comment}
        </p>
      )}

      {/* 인스타그램 임베드 */}
      <div className="mb-6">
        <InstagramEmbed url={post.instagram_url} />
      </div>

      {/* 댓글 */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-500 mb-4">댓글 {comments.length}개</p>
        <div className="flex flex-col gap-3 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <span className="text-xs font-medium text-white shrink-0">{c.author}</span>
              <span className="text-xs text-zinc-300">{c.content}</span>
            </div>
          ))}
        </div>

        {user ? (
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="댓글 달기..."
              className="flex-1 bg-zinc-900 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none"
            />
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="text-sm text-white disabled:text-zinc-600 px-2 transition"
            >
              게시
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">댓글을 달려면 이름을 선택하세요</p>
        )}
      </div>
    </main>
  );
}
