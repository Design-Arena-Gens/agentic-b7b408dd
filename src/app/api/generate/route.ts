import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server missing OPENAI_API_KEY" }), { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    const url = result.data?.[0]?.url;
    if (!url) {
      return new Response(JSON.stringify({ error: "No image URL returned" }), { status: 500 });
    }

    return new Response(JSON.stringify({ imageUrl: url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to generate" }), { status: 500 });
  }
}
