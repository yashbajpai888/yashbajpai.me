export async function sendEmailNotification(data: {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  service?: string;
  createdAt: string;
  submissionId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !adminEmail) {
    console.warn("Resend email notification skipped: RESEND_API_KEY or ADMIN_EMAIL is not set.");
    return { success: false, error: "Missing config" };
  }

  try {
    const adminUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/contacts` 
      : "https://yashbajpai-me.vercel.app/admin/contacts";

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <h2 style="color: #e11d48; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">NEW PORTFOLIO INQUIRY</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 6px 0;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #e11d48; text-decoration: none;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 6px 0; font-family: monospace;">${data.phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Company:</td>
            <td style="padding: 6px 0;">${data.company || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Service/Subject:</td>
            <td style="padding: 6px 0;">${data.service || "Not specified"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Submitted:</td>
            <td style="padding: 6px 0; font-size: 13px; color: #718096;">${data.createdAt}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #e11d48; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #475569; font-size: 13px;">Message:</h4>
          <p style="margin: 0; line-height: 1.5; font-size: 14px; white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <div style="margin-top: 25px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background-color: #e11d48; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">View in Admin Panel</a>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Admin <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Portfolio Inquiry from ${data.name}`,
        html: htmlContent,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.message || "Resend API call failed");
    }

    return { success: true, data: resData };
  } catch (error: any) {
    console.error("Failed to send email notification:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsAppNotification(data: {
  name: string;
  message: string;
  phone?: string;
  service?: string;
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER;

  if (!token || !phoneId || !recipient) {
    console.warn("WhatsApp notification skipped: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, or WHATSAPP_RECIPIENT_NUMBER is not set.");
    return { success: false, error: "Missing config" };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    
    // We send a text message layout using Meta Graph API.
    // Note: Cloud API usually requires a template for business-initiated contacts.
    // If the template is hello_world (default) or a custom template, we can document it.
    // Here we implement the custom text message send payload, and we log outcomes.
    const messageBody = `*New Portfolio Inquiry*\n*Name:* ${data.name}\n*Service:* ${data.service || "General"}\n*Phone:* ${data.phone || "N/A"}\n*Message:* ${data.message.substring(0, 150)}${data.message.length > 150 ? "..." : ""}`;

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: messageBody,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error?.message || "WhatsApp Business API call failed");
    }

    return { success: true, data: resData };
  } catch (error: any) {
    console.error("Failed to send WhatsApp notification:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWeb3FormsNotification(data: {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  service?: string;
  createdAt?: string;
  submissionId?: string;
}) {
  const accessKey =
    process.env.WEB3FORMS_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
    "b913a243-f1b0-4ba6-baad-c617848cd74a";

  if (!accessKey) {
    console.warn("Web3Forms notification skipped: WEB3FORMS_ACCESS_KEY is not set.");
    return { success: false, error: "Missing config" };
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Portfolio Inquiry from ${data.name}`,
        from_name: "Yash Bajpai Portfolio",
        name: data.name,
        email: data.email,
        phone: data.phone || "Not provided",
        company: data.company || "Not provided",
        service: data.service || "General Inquiry",
        message: data.message,
        submission_id: data.submissionId || "",
        submitted_at: data.createdAt || new Date().toISOString(),
      }),
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || "Web3Forms API call failed");
    }

    return { success: true, data: resData };
  } catch (error: any) {
    console.error("Failed to send Web3Forms notification:", error);
    return { success: false, error: error.message };
  }
}

