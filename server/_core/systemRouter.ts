import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  /**
   * Returns the D-ID API token for use with the browser SDK.
   * The token is the same Basic auth credential used server-side.
   * Using it in the SDK allows the WebSocket to connect directly to D-ID's
   * notification server (wss://notifications.d-id.com) with valid credentials.
   */
  getDIDToken: publicProcedure.query(() => ({
    token: process.env.DID_API_KEY ?? "",
  })),

  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
