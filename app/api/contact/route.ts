import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/firebase";
import { sendEmailNotification, sendWhatsAppNotification, sendWeb3FormsNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, phone, company, service } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const res = await sendContactMessage({ name, email, message, phone, company });
    const submissionId = res.id || `mock-${Date.now()}`;
    const createdAtString = new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC";

    // Attempt to send notifications in background
    Promise.allSettled([
      sendWeb3FormsNotification({
        name,
        email,
        message,
        phone,
        company,
        service,
        createdAt: createdAtString,
        submissionId
      }),
      sendEmailNotification({
        name,
        email,
        message,
        phone,
        company,
        service,
        createdAt: createdAtString,
        submissionId
      }),
      sendWhatsAppNotification({
        name,
        message,
        phone,
        service
      })
    ]).catch((err) => {
      console.error("Notification promise error:", err);
    });


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

