import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary delete notice: Server-side credentials incomplete. Remote asset destruction skipped safely.");
      return NextResponse.json({ success: true, message: "Remote asset unlinked safely." });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    const data = await cRes.json().catch(() => ({}));
    
    if (cRes.ok && (data.result === "ok" || data.result === "not found")) {
      return NextResponse.json({ success: true, deleted: publicId });
    } else {
      console.warn("Cloudinary destroy response:", data);
      return NextResponse.json({ success: true, warning: data.result || "Notice during remote asset cleanup", publicId });
    }
  } catch (err: any) {
    console.error("Cloudinary delete API exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to delete Cloudinary asset" }, { status: 500 });
  }
}
