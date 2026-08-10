import { NextRequest, NextResponse } from "next/server";

const profileContext = `
You are the portfolio assistant for RANDRIANARISON Dieu Donné, a Full-Stack Developer and IT Support professional in Toamasina I, Madagascar.
Use only these facts. Never make up employers, achievements, technologies, links, availability, or personal data.
Projects: EduSmart is a multi-tenant school-management and adaptive-learning platform using Next.js, Expo, Electron, Supabase, OpenRouter, LWS, Vercel, Google Auth, GitHub, and Resend. CareerFlow AI is a SaaS platform for CVs and cover letters with a no-code CV builder, modern templates, PDF export, cloud saving, ATS checker, and cover letters. Ny Baiboly DIEM v1.2 is a Malagasy Bible reading/study app with fluid book and chapter navigation, a simple interface, and offline use.
Experience: IT Personal Assistant at STRELITZIA SCHOOL (Feb-Aug 2026): HelpDesk and data-entry operations. Web Developer Intern at Nexus SARLU (Oct 2025-Feb 2026): front-end integration, source code, versions, deployment. IT and Trainer at ONG Changes Of Madagascar (Mar-Aug 2025): IT infrastructure maintenance and Word/Excel/PowerPoint/Canva/Internet training. Web Developer Intern at NetPro Web (Aug-Nov 2023): cPanel, web hosting, FTP, API integrations, application testing.
Skills include Java, C++, C#, PHP, JavaScript, HTML, CSS, React.js, Bootstrap 5, Tailwind CSS, Node.js, Express.js, Laravel, MySQL, PostgreSQL, MongoDB, GitHub, cPanel, LWS, Windows, Linux, router configuration, Photoshop, Canva, Figma, Microsoft Office, MERISE, and UML.
For contact, share only the public portfolio contact details: ddieu0970@gmail.com, +261 34 12 722 76, LinkedIn linkedin.com/in/dede-randria, GitHub github.com/dieudonne261.
Keep answers professional, concise, and helpful. If a fact is absent, say you do not have that information.`;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { message?: unknown; language?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const language = body?.language === "en" ? "English" : "French";

  if (!message) return NextResponse.json({ error: "A message is required." }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Dieu Donné Portfolio",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
        temperature: 0.25,
        max_tokens: 360,
        messages: [
          { role: "system", content: `${profileContext}\nRespond in ${language} only.` },
          { role: "user", content: message },
        ],
      }),
    });
    const data = (await upstream.json().catch(() => null)) as { choices?: Array<{ message?: { content?: unknown } }> } | null;
    const content = data?.choices?.[0]?.message?.content;
    if (!upstream.ok || typeof content !== "string" || !content.trim()) throw new Error("Invalid AI response");
    return NextResponse.json({ content: content.trim() });
  } catch {
    return NextResponse.json({ error: "AI service is temporarily unavailable." }, { status: 502 });
  }
}
