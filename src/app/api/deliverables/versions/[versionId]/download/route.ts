/**
 * GET /api/deliverables/versions/[versionId]/download
 *
 * Streams the stored bytes of one deliverable version. Authorization:
 *   - an admin (ADMIN_EMAILS) may download any version, or
 *   - an employee assigned to the version's project may download it, or
 *   - the owning client may download a version whose deliverable is
 *     `clientVisible` and whose project's `clientId` is the current user.
 *
 * Link deliverables have no stored bytes — 404 (the UI links out directly).
 * Node runtime (Prisma + fs via the storage abstraction). `?inline=1` serves
 * with `Content-Disposition: inline` for in-browser preview.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/lib/rbac/session";
import { getAdminUser } from "@/lib/admin-auth";
import { getEmployeeUser } from "@/lib/employee-auth";
import { employeeProjectIds } from "@/lib/employee-dashboard";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { getRateLimiter, RATE_POLICIES, clientKeyFromHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params;

  // Throttle download traffic per client. This route returns raw bytes and its
  // own bespoke response shapes, so it uses the limiter directly rather than the
  // `withApi` envelope.
  const { limit, windowMs } = RATE_POLICIES.download;
  const rl = await getRateLimiter().consume(
    `download:${clientKeyFromHeaders(request.headers)}`,
    limit,
    windowMs
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: { message: "Too many requests." } },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const version = await prisma.deliverableVersion.findUnique({
    where: { id: versionId },
    include: {
      deliverable: {
        select: {
          clientVisible: true,
          project: { select: { id: true, clientId: true } },
        },
      },
    },
  });

  if (!version || !version.storageKey) {
    return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
  }

  // Authorize: admin OR assigned employee OR owning client of a client-visible
  // deliverable.
  const admin = await getAdminUser();
  if (!admin) {
    const employee = await getEmployeeUser();
    if (employee) {
      const ids = await employeeProjectIds(employee.id);
      if (!ids.includes(version.deliverable.project.id)) {
        return NextResponse.json({ error: { message: "Forbidden." } }, { status: 403 });
      }
    } else {
      const session = await getServerSession();
      const userId = session?.user?.id ?? null;
      const owns =
        version.deliverable.clientVisible &&
        version.deliverable.project.clientId != null &&
        version.deliverable.project.clientId === userId;
      if (!owns) {
        return NextResponse.json({ error: { message: "Forbidden." } }, { status: 403 });
      }
    }
  }

  let bytes: Buffer;
  try {
    bytes = await getStorage().get(version.storageKey);
  } catch {
    return NextResponse.json({ error: { message: "File unavailable." } }, { status: 404 });
  }

  const inline = request.nextUrl.searchParams.get("inline") === "1";
  const fileName = version.fileName ?? "download";
  const body = new Uint8Array(bytes);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": version.contentType ?? "application/octet-stream",
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
