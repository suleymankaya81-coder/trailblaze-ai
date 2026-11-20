import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY local-only import endpoint; removed before commit.
export const Route = createFileRoute("/api/tmp-au-import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const fs = await import("node:fs");
        let token = "";
        try { token = fs.readFileSync("/tmp/au-import-token", "utf8"); } catch { return new Response("no", { status: 404 }); }
        if (!token || request.headers.get("x-import-token") !== token) return new Response("no", { status: 404 });
        const body = await request.json();
        if (body.probe) return Response.json({ has: !!process.env.SUPABASE_SERVICE_ROLE_KEY });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const out: unknown[] = [];
        for (const op of body.ops as { table: string; method: string; rows?: unknown; match?: Record<string, string>; onConflict?: string }[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const t = (supabaseAdmin as any).from(op.table);
          const r = op.method === "upsert" ? await t.upsert(op.rows, { onConflict: op.onConflict }).select("id")
            : op.method === "delete" ? await t.delete().match(op.match)
            : op.method === "select" ? await t.select("*").match(op.match)
            : await t.insert(op.rows).select("id");
          out.push({ error: r.error?.message ?? null, data: r.data });
          if (r.error) break;
        }
        return Response.json(out);
      },
    },
  },
});
