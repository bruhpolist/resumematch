import { NextResponse } from "next/server";
import { pool } from "@/server/db.mjs";
import { mapResumeRowToDto, readUserFromRequest, unauthorized } from "@/server/core.mjs";
import { resumeSchema } from "@/server/schemas.mjs";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await readUserFromRequest(request);

  const result = await pool.query(
    `
      SELECT id, full_description, user_id, is_public, created_at, updated_at
      FROM resumes
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const isOwner = user?.id === row.user_id;
  if (!row.is_public && !isOwner) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({ resume: mapResumeRowToDto(row) });
}

export async function PUT(request, { params }) {
  const user = await readUserFromRequest(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = resumeSchema.safeParse(body?.resume);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid resume payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await pool.query(
    `
      UPDATE resumes
      SET full_description = $1,
          is_public = $2,
          updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING id, full_description, user_id, is_public, created_at, updated_at
    `,
    [JSON.stringify(parsed.data), parsed.data.public, id, user.id]
  );

  if (updated.rowCount === 0) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ resume: mapResumeRowToDto(updated.rows[0]) });
}

export async function DELETE(request, { params }) {
  const user = await readUserFromRequest(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const deleted = await pool.query(
    "DELETE FROM resumes WHERE id = $1 AND user_id = $2",
    [id, user.id]
  );

  if (deleted.rowCount === 0) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
