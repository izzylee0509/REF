import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function downloadAndStore(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const fileName = `thumbnails/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("thumbnails")
      .upload(fileName, buffer, { contentType });

    if (error) return null;

    const { data } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
    return data.publicUrl;
  } catch {
    return null;
  }
}

async function getInstagramPreview(url: string) {
  try {
    const cleanUrl = url.split("?")[0].replace(/\/$/, "") + "/";
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    const html = await res.text();

    const ogImage = html.match(
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/
    )?.[1];
    const ogDesc = html.match(
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/
    )?.[1];

    if (!ogImage) return { thumbnail_url: null, caption: ogDesc ?? null };

    const storedUrl = await downloadAndStore(ogImage);
    return { thumbnail_url: storedUrl, caption: ogDesc ?? null };
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

  const { data, error } = await supabase
    .from("posts")
    .insert({
      instagram_url,
      shared_by,
      comment: comment || null,
      thumbnail_url,
      caption,
    })
    .select()
    .single();

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
