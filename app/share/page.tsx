"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const TEAM = ["Izzy", "Jay", "Soyoung"];

function ShareForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const url =
    searchParams.get("url") ||
    searchParams.get("text") ||
    "";

  useEffect(() => {
    const saved = localStorage.getItem("eo_user");
    if (saved) setUser(saved);
  }, []);

  const handleSubmit = async () => {
    if (!user || !url) return;
    setSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagram_url: url, shared_by: user, comment }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert("오류: " + (err.error || "알 수 없는 오류"));
      setSubmitting(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/"), 1500);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-2xl mb-2">✓</p>
        <p className="text-white">공유 완료!</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-lg font-bold mb-6">레퍼런스 공유</h1>

      {/* URL 미리보기 */}
      <div className="bg-zinc-900 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-zinc-500 mb-1">공유할 포스트</p>
        <p className="text-sm text-zinc-300 break-all line-clamp-2">{url || "URL 없음"}</p>
      </div>

      {/* 이름 선택 */}
      {!user ? (
        <div className="mb-6">
          <p className="text-sm text-zinc-400 mb-3">나는 누구?</p>
          <div className="flex gap-2">
            {TEAM.map((name) => (
              <button
                key={name}
                onClick={() => {
                  localStorage.setItem("eo_user", name);
                  setUser(name);
                }}
                className="px-4 py-2 bg-zinc-800 rounded-full text-sm hover:bg-zinc-700 transition"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-zinc-400">공유자:</span>
          <span className="text-sm font-medium">{user}</span>
          <button
            onClick={() => { localStorage.removeItem("eo_user"); setUser(null); }}
            className="text-xs text-zinc-600 hover:text-white ml-1"
          >
            변경
          </button>
        </div>
      )}

      {/* 코멘트 */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="코멘트 남기기 (선택)"
        className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none resize-none mb-4"
        rows={3}
      />

      <button
        onClick={handleSubmit}
        disabled={!user || !url || submitting}
        className="w-full py-3 bg-white text-black rounded-full font-medium text-sm disabled:opacity-30 transition"
      >
        {submitting ? "공유 중..." : "공유하기"}
      </button>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareForm />
    </Suspense>
  );
}
