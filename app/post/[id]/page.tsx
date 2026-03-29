"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  instagram_url: string;
  thumbnail_url: string | null;
  caption: string | null;
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

      {/* 썸네일 */}
      {post.thumbnail_url ? (
        <img
          src={post.thumbnail_url}
          alt="Instagram post"
          className="w-full rounded-xl object-cover mb-4"
        />
      ) : (
        <div className="w-full aspect-square bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
          <span className="text-zinc-500 text-sm">미리보기 없음</span>
        </div>
      )}

      {/* 원본 링크 */}
      <a
        href={post.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-400 hover:text-white transition mb-4 block"
      >
        인스타그램에서 보기 →
      </a>

      {/* 공유자 정보 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">{post.shared_by}</span>
        <span className="text-xs text-zinc-500">{date}</span>
      </div>

      {/* 공유 코멘트 */}
      {post.comment && (
        <p className="text-sm text-zinc-300 bg-zinc-900 rounded-xl px-4 py-3 mb-6">
          {post.comment}
        </p>
      )}

      {/* 댓글 */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-500 mb-4">댓글 {comments.length}개</p>
        <div className="flex flex-col gap-3 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <span className="text-xs font-medium text-white shrink-0">
                {c.author}
              </span>
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
