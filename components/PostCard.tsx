"use client";
import Link from "next/link";

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

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.created_at).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/post/${post.id}`}>
      <div className="bg-zinc-900 rounded-xl overflow-hidden hover:bg-zinc-800 transition cursor-pointer">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt="Instagram post"
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-500 text-sm">미리보기 없음</span>
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-400">
              {post.shared_by}
            </span>
            <span className="text-xs text-zinc-600">{date}</span>
          </div>
          {post.comment && (
            <p className="text-sm text-white line-clamp-2">{post.comment}</p>
          )}
          {(post.comment_count ?? 0) > 0 && (
            <p className="text-xs text-zinc-500 mt-2">
              댓글 {post.comment_count}개
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
