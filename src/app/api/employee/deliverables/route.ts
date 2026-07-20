/**
 * POST /api/employee/deliverables — employee deliverable upload.
 *
 * The employee analogue of `/api/admin/deliverables`. Same multipart contract
 * (file or link, new deliverable or new version), same passage through the
 * storage abstraction + Deliverable Service (which logs every upload to the
 * Timeline Service, which the realtime layer fans out). The ONLY differences:
 *   - the caller must be an employee (EMPLOYEE_EMAILS / admin), AND
 *   - the target project must be one they're ASSIGNED to.
 *
 * Employees can UPLOAD but never APPROVE — approval is not reachable here (it
 * lives only in the admin surface), so an uploaded deliverable stays `pending`
 * until an admin reviews it. Node runtime (Prisma + fs).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getEmployeeUser } from "@/lib/employee-auth";
import { employeeProjectIds } from "@/lib/employee-dashboard";
import { prisma } from "@/lib/prisma";
import {
  uploadFileDeliverable,
  addLinkDeliverable,
  addDeliverableVersion,
} from "@/lib/deliverable-service";
import { DELIVERABLE_KIND, DELIVERABLE_MAX_UPLOAD_BYTES } from "@/constants/project";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

export async function POST(request: NextRequest) {
  const employee = await getEmployeeUser();
  if (!employee) return bad("Forbidden: employee access required.", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Expected multipart/form-data.");
  }

  const kind = String(form.get("kind") ?? DELIVERABLE_KIND.FILE);
  const projectId = String(form.get("projectId") ?? "").trim();
  const deliverableId = (form.get("deliverableId") as string | null)?.trim() || null;
  const phaseRaw = (form.get("phaseId") as string | null)?.trim();
  const phaseId = phaseRaw ? phaseRaw : null;
  const title = String(form.get("title") ?? "").trim();
  const description = (form.get("description") as string | null)?.trim() || null;
  const note = (form.get("note") as string | null)?.trim() || null;
  const clientVisible = String(form.get("clientVisible") ?? "true") !== "false";

  if (!projectId && !deliverableId) return bad("projectId or deliverableId is required.");

  // Authorize against the employee's assigned projects. For a new version we
  // resolve the deliverable's project first, then check assignment.
  const assignedIds = await employeeProjectIds(employee.id);
  let targetProjectId = projectId;
  if (deliverableId) {
    const deliverable = await prisma.deliverable.findUnique({
      where: { id: deliverableId },
      select: { projectId: true },
    });
    if (!deliverable) return bad("Deliverable not found.", 404);
    targetProjectId = deliverable.projectId;
  }
  if (!assignedIds.includes(targetProjectId)) {
    return bad("Forbidden: not assigned to this project.", 403);
  }

  try {
    // ── New version of an existing deliverable ──────────────────────────────
    if (deliverableId) {
      if (kind === DELIVERABLE_KIND.LINK) {
        const externalUrl = String(form.get("externalUrl") ?? "").trim();
        if (!externalUrl) return bad("externalUrl is required for a link version.");
        const result = await addDeliverableVersion({
          deliverableId,
          externalUrl,
          note,
          actorId: employee.id,
        });
        return NextResponse.json({ data: result }, { status: 201 });
      }
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) return bad("A non-empty file is required.");
      if (file.size > DELIVERABLE_MAX_UPLOAD_BYTES) return bad("File exceeds the 25MB limit.", 413);
      const result = await addDeliverableVersion({
        deliverableId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        data: Buffer.from(await file.arrayBuffer()),
        note,
        actorId: employee.id,
      });
      return NextResponse.json({ data: result }, { status: 201 });
    }

    // ── New deliverable ─────────────────────────────────────────────────────
    if (!title) return bad("title is required.");

    if (kind === DELIVERABLE_KIND.LINK) {
      const externalUrl = String(form.get("externalUrl") ?? "").trim();
      if (!externalUrl) return bad("externalUrl is required for a link deliverable.");
      const result = await addLinkDeliverable({
        projectId,
        phaseId,
        title,
        description,
        clientVisible,
        externalUrl,
        note,
        actorId: employee.id,
      });
      return NextResponse.json({ data: result }, { status: 201 });
    }

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return bad("A non-empty file is required.");
    if (file.size > DELIVERABLE_MAX_UPLOAD_BYTES) return bad("File exceeds the 25MB limit.", 413);
    const result = await uploadFileDeliverable({
      projectId,
      phaseId,
      title,
      description,
      clientVisible,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      data: Buffer.from(await file.arrayBuffer()),
      note,
      actorId: employee.id,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("[api/employee/deliverables] upload failed:", error);
    return bad("Upload failed.", 500);
  }
}
