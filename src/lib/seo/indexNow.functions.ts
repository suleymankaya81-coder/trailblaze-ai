import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { INDEXNOW_MAX_URLS, submitIndexNow } from "./indexNow";

/**
 * Notify IndexNow that pages were published or changed. Server-side only in effect: the caller must
 * send the secret INDEXNOW_SUBMIT_TOKEN (environment variable); without it configured, nothing is sent.
 * The content pipeline pings directly (scripts/content-pipeline/indexnow.py); this endpoint is for
 * publishing tools that run outside the pipeline.
 */
export const notifyIndexNow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(16).max(200), urls: z.array(z.string().url().max(2000)).min(1).max(INDEXNOW_MAX_URLS) }).parse(input),
  )
  .handler(async ({ data }) => {
    const expected = process.env.INDEXNOW_SUBMIT_TOKEN;
    if (!expected || data.token !== expected) throw new Error("Not allowed");
    return { results: await submitIndexNow(data.urls) };
  });
