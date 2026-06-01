import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // D-ID API proxy — forwards browser SDK requests to api.d-id.com using the server-side API key
  // This avoids the clientKey allowed_origins restriction (clientKey requires Studio UI config)
  app.all("/api/did-proxy/*", async (req, res) => {
    const DID_API_KEY = process.env.DID_API_KEY || "";
    const subPath = req.path.replace("/api/did-proxy", "");
    const targetUrl = `https://api.d-id.com${subPath}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
    try {
      const headers: Record<string, string> = {
        "Authorization": `Basic ${DID_API_KEY}`,
        "Content-Type": "application/json",
      };
      // Forward relevant headers from the client (except auth — we replace it)
      if (req.headers["x-playground-chat"]) headers["X-Playground-Chat"] = req.headers["x-playground-chat"] as string;
      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };
      if (req.method !== "GET" && req.method !== "HEAD") {
        fetchOptions.body = JSON.stringify(req.body);
      }
      const upstream = await fetch(targetUrl, fetchOptions);
      const contentType = upstream.headers.get("content-type") || "application/json";
      res.status(upstream.status);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      const text = await upstream.text();
      res.send(text);
    } catch (err) {
      console.error("[DID Proxy] Error:", err);
      res.status(502).json({ message: "D-ID proxy error" });
    }
  });
  // D-ID proxy OPTIONS preflight
  app.options("/api/did-proxy/*", (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Playground-Chat");
    res.sendStatus(200);
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
