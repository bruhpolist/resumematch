import { NextResponse } from "next/server";
import { pool } from "@/server/db.mjs";
import { mapResumeRowToDto, readUserFromRequest, unauthorized } from "@/server/core.mjs";
import { resumeSchema } from "@/server/schemas.mjs";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await readUserFromRequest(request);
  if (!user) return unauthorized();

  const result = await pool.query(
    `
      SELECT id, full_description, user_id, is_public, created_at, updated_at
      FROM resumes
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `,
    [user.id]
  );

  return NextResponse.json({ resumes: result.rows.map(mapResumeRowToDto) });
}

export async function POST(request) {
  const user = await readUserFromRequest(request);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = resumeSchema.safeParse(body?.resume);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid resume payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const resume = parsed.data;
  const created = await pool.query(
    `
      INSERT INTO resumes (full_description, user_id, is_public)
      VALUES ($1, $2, $3)
      RETURNING id, full_description, user_id, is_public, created_at, updated_at
    `,
    [JSON.stringify(resume), user.id, resume.public]
  );

  return NextResponse.json({ resume: mapResumeRowToDto(created.rows[0]) }, { status: 201 });
}
