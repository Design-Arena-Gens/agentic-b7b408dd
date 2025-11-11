"use client";

import { useState } from "react";

type GenerateResponse = { imageUrl: string };

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("sketch");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stylePrefix: Record<string, string> = {
    sketch: "detailed pencil sketch portrait, cross-hatching, expressive lines",
    realism: "photorealistic portrait, dramatic lighting, high detail, 50mm lens",
    watercolor: "watercolor portrait, soft washes, delicate gradients, paper texture",
    anime: "anime style portrait, clean lines, vibrant colors, studio quality",
    oil: "oil painting portrait, impasto brush strokes, baroque lighting"
  };

  async function generate() {
    setMessage(null);
    setImageUrl(null);
    setLoading(true);
    try {
      const fullPrompt = `${stylePrefix[style]} of a human ${prompt}`.trim();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed: ${res.status}`);
      }
      const data: GenerateResponse = await res.json();
      setImageUrl(data.imageUrl);
    } catch (err: any) {
      setMessage(err.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  }

  async function uploadToInstagram() {
    if (!imageUrl) return;
    setUploading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `Upload failed: ${res.status}`);
      setMessage("Uploaded to Instagram successfully");
    } catch (err: any) {
      setMessage(err.message || "Failed to upload to Instagram");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Human Art Image Agent</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Generate human art images in various styles and upload to Instagram.
      </p>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Prompt detail (e.g., smiling woman, side light, studio backdrop)</label>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the person and vibe..."
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #2a3340', background: '#10161d', color: '#e6edf3' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #2a3340', background: '#10161d', color: '#e6edf3' }}>
            <option value="sketch">Pencil Sketch</option>
            <option value="realism">Realism</option>
            <option value="watercolor">Watercolor</option>
            <option value="anime">Anime</option>
            <option value="oil">Oil Painting</option>
          </select>
        </div>
        <button onClick={generate} disabled={loading} style={{
          background: '#3b82f6', border: 'none', padding: '12px 16px', borderRadius: 8, color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Generating?' : 'Generate Image'}
        </button>
      </section>

      {imageUrl && (
        <section style={{ marginTop: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img src={imageUrl} alt="Generated" style={{ maxWidth: 512, borderRadius: 12, border: '1px solid #2a3340' }} />
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Instagram Caption</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6}
                placeholder="#art #portrait #aiart"
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #2a3340', background: '#10161d', color: '#e6edf3' }} />
              <button onClick={uploadToInstagram} disabled={uploading}
                style={{ marginTop: 12, background: '#10b981', border: 'none', padding: '12px 16px', borderRadius: 8, color: 'white', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Uploading?' : 'Upload to Instagram'}
              </button>
            </div>
          </div>
        </section>
      )}

      {message && (
        <p style={{ marginTop: 8, color: message.includes('success') ? '#10b981' : '#f87171' }}>{message}</p>
      )}

      <footer style={{ marginTop: 32, opacity: 0.6 }}>
        Tip: set environment variables OPENAI_API_KEY, INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_IG_USER_ID.
      </footer>
    </main>
  );
}
