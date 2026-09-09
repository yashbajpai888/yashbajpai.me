import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // 1. Upload via Cloudinary REST API if configured
    if (
      cloudName &&
      uploadPreset &&
      cloudName !== "your_cloudinary_cloud_name" &&
      uploadPreset !== "your_cloudinary_upload_preset"
    ) {
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      const resourceType = isVideo || isAudio ? "video" : file.type.startsWith("image/") ? "image" : "raw";

      const cFormData = new FormData();
      cFormData.append("file", file);
      cFormData.append("upload_preset", uploadPreset);

      const cRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: cFormData,
        }
      );

      if (cRes.ok) {
        const data = await cRes.json();
        if (data.secure_url) {
          return NextResponse.json({ 
            success: true, 
            url: data.secure_url, 
            publicId: data.public_id || "", 
            provider: "cloudinary" 
          });
        }
      } else {
        const errorData = await cRes.json().catch(() => ({}));
        console.warn("Server Cloudinary upload failed:", errorData);
      }
    }

    return NextResponse.json(
      {
        error:
          "Cloudinary credentials not configured or upload failed. Falling back to Firebase Storage.",
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
