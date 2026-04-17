import { NextResponse } from "next/server";
import { importResumeFromText } from "@/server/openrouter.mjs";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const resumeText = typeof body?.resumeText === "string" ? body.resumeText.trim() : "";

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const importedResume = await importResumeFromText({
      resumeText,
      env: process.env,
    });

    return NextResponse.json({ importedResume });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to import resume",
      },
      { status: 500 }
    );
  }
}
