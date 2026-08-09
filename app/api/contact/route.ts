import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const res = await sendContactMessage({ name, email, message });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Yash will get back to you shortly.",
      data: res
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
