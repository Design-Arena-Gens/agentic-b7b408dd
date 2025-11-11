import { NextRequest } from "next/server";

export const runtime = "nodejs";

const GRAPH_VERSION = "v21.0";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, caption } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing imageUrl" }), { status: 400 });
    }

    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_IG_USER_ID;

    if (!token || !userId) {
      return new Response(JSON.stringify({ error: "Server missing Instagram credentials" }), { status: 500 });
    }

    // 1) Create media container
    const createRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ image_url: imageUrl, caption: caption || "", access_token: token })
    });

    const createJson = await createRes.json();
    if (!createRes.ok) {
      return new Response(JSON.stringify({ error: createJson.error?.message || "Failed to create container" }), { status: 400 });
    }

    const containerId = createJson.id;
    if (!containerId) {
      return new Response(JSON.stringify({ error: "No container id returned" }), { status: 500 });
    }

    // 2) Publish
    const publishRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: String(containerId), access_token: token })
    });

    const publishJson = await publishRes.json();
    if (!publishRes.ok) {
      return new Response(JSON.stringify({ error: publishJson.error?.message || "Failed to publish" }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, id: publishJson.id || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Upload failed" }), { status: 500 });
  }
}
