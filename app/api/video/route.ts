import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const url = searchParams.get("url");

  let targetUrl = "";
  if (id) {
    targetUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  } else if (url) {
    targetUrl = decodeURIComponent(url);
  } else {
    return new NextResponse("Missing video id or url", { status: 400 });
  }

  try {
    const range = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (range) {
      fetchHeaders["Range"] = range;
    }

    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: "follow",
    });

    if (!response.ok && response.status !== 206) {
      // If Google Drive download endpoint redirects or requires fallback
      return NextResponse.redirect(targetUrl);
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges") || "bytes";

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType.includes("html") ? "video/mp4" : contentType,
      "Accept-Ranges": acceptRanges,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    };

    if (contentLength) responseHeaders["Content-Length"] = contentLength;
    if (contentRange) responseHeaders["Content-Range"] = contentRange;

    return new NextResponse(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Video proxy error:", err);
    return new NextResponse("Failed to stream video", { status: 500 });
  }
}
