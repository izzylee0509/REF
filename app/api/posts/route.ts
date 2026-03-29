import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getInstagramPreview(url: string) {
  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
      headers: { "x-api-key": "" },
    });
    if (!res.ok) return { thumbnail_url: null, caption: null };
    const data = await res.json();
    return {
      thumbnail_url: data.data?.image?.url ?? data.data?.screenshot?.url ?? null,
      caption: data.data?.description ?? data.data?.title ?? null,
    };
  } catch {
    return { thumbnail_url: null, caption: null };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { instagram_url, shared_by, comment } = body;

  if (!instagram_url || !shared_by) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { thumbnail_url, caption } = await getInstagramPreview(instagram_url);

  const { data, error } = await supabase.from("posts").insert({
    instagram_url,
    shared_by,
    comment: comment || null,
    thumbnail_url,
    caption,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
