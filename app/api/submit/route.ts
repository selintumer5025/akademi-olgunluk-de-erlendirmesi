import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 5;
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= limit) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { email, consent, results, answersSummary } = body;

  if (!email || !consent) {
    return NextResponse.json(
      { ok: false, error: "Email and consent required" },
      { status: 400 }
    );
  }

  // answersSummary is accepted but not used when SMTP is not configured
  void answersSummary;

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
      });

      const dimensionRows = results.dimensionScores
        .map(
          (ds: { name: string; average: number; percentage: number; comment: string }) =>
            `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">${ds.name}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${ds.average}/5</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${ds.percentage}%</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${ds.comment}</td></tr>`
        )
        .join("");

      const actionItems = results.actionPlan
        .map((a: string, i: number) => `<li style="margin-bottom:8px">${i + 1}. ${a}</li>`)
        .join("");

      await transporter.sendMail({
        from: `"Kolektif360" <${smtpUser}>`,
        to: email,
        subject: "Kurumsal Akademi Olgunluk Testi – Sonuç Raporunuz",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0">
              <h1 style="color:white;font-size:20px;margin:0">Kurumsal Akademi Olgunluk Testi</h1>
              <p style="color:#94a3b8;font-size:14px;margin:8px 0 0">Sonuç Raporu – ${new Date().toLocaleDateString("tr-TR")}</p>
            </div>
            <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px">
              <p style="font-size:18px;font-weight:bold">Toplam Skor: ${results.totalScore} / 150</p>
              <p style="font-size:16px">Seviye ${results.level} – ${results.levelName}</p>
              <p style="color:#64748b;font-size:14px">${results.levelDescription}</p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
              <h3>Boyut Skorları</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead><tr style="background:#e2e8f0"><th style="padding:8px;text-align:left">Boyut</th><th style="padding:8px">Ort.</th><th style="padding:8px">%</th><th style="padding:8px;text-align:left">Değerlendirme</th></tr></thead>
                <tbody>${dimensionRows}</tbody>
              </table>
              <h3>90 Günlük Aksiyon Planı</h3>
              <ul style="padding-left:20px;font-size:14px;color:#334155">${actionItems}</ul>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
              <div style="background:#0f172a;padding:16px;border-radius:8px;text-align:center">
                <p style="color:white;font-weight:bold;margin:0 0 8px">Kolektif360 ile Sonraki Adımınızı Planlayın</p>
                <a href="https://www.kolektif360.com/iletisim" style="color:#60a5fa;font-size:14px">www.kolektif360.com/iletisim</a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Email send error:", err);
      return NextResponse.json(
        { ok: false, error: "Email sending failed" },
        { status: 500 }
      );
    }
  } else {
    console.log("[MOCK EMAIL] Would send to:", email);
    console.log("[MOCK EMAIL] Results:", JSON.stringify({ totalScore: results.totalScore, level: results.level }, null, 2));
  }

  return NextResponse.json({ ok: true });
}
