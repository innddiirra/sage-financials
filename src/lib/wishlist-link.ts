import { createServerFn } from "@tanstack/react-start";

export type LinkAnalysis = {
  name: string | null;
  imageUrl: string | null;
  price: number | null;
};

/** Blocks the classic SSRF targets — this endpoint fetches whatever URL the person pastes in. */
function isSafeUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return false;
  if (host === "0.0.0.0" || host === "::1" || host === "[::1]") return false;
  // Private / loopback / link-local IPv4 ranges.
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;

  return true;
}

/** Parses every <meta property="..." content="..."> (or name=) tag, order-agnostic. */
function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const metaRegex = /<meta\s+([^>]*?)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = metaRegex.exec(html))) {
    const attrs = match[1];
    const key = attrs.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
    const content = attrs.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
    if (key && content !== undefined) tags[key.toLowerCase()] = content;
  }
  return tags;
}

function extractTitleTag(html: string): string | null {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null;
}

function extractJsonLdPrice(html: string): number | null {
  const match = html.match(/"price"\s*:\s*"?([\d]+(?:[.,]\d+)?)"?/i);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const value = Number(raw.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export const analyzeProductLink = createServerFn({ method: "POST" })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }): Promise<LinkAnalysis> => {
    if (!isSafeUrl(data.url)) {
      throw new Error("That link doesn't look like a valid, public URL.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let html: string;
    try {
      const res = await fetch(data.url, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) throw new Error(`The page responded with ${res.status}.`);
      html = await res.text();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("That link took too long to respond.");
      }
      throw new Error("Couldn't reach that link — it may block automated requests.");
    } finally {
      clearTimeout(timeout);
    }

    const meta = extractMetaTags(html);
    const name = meta["og:title"] || meta["twitter:title"] || extractTitleTag(html);
    const imageUrl = meta["og:image"] || meta["og:image:secure_url"] || meta["twitter:image"] || null;
    const price =
      parsePrice(meta["product:price:amount"]) ??
      parsePrice(meta["og:price:amount"]) ??
      parsePrice(meta["twitter:data1"]) ??
      extractJsonLdPrice(html);

    return { name, imageUrl, price };
  });
