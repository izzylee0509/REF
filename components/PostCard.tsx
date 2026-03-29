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
        <div className="w-full aspect-square bg-zinc-800 flex flex-col items-center justify-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="#52525b" stroke="none"/>
          </svg>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-400">{post.shared_by}</span>
            <span className="text-xs text-zinc-600">{date}</span>
          </div>
          {post.comment && (
            <p className="text-sm text-white line-clamp-2">{post.comment}</p>
          )}
          {(post.comment_count ?? 0) > 0 && (
            <p className="text-xs text-zinc-500 mt-2">댓글 {post.comment_count}개</p>
          )}
        </div>
      </div>
    </Link>
  );
}
