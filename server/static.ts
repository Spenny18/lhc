import express from 'express';
import type { Express, Request, Response } from 'express';
import fs from "node:fs";
import path from "node:path";
import { metaForPath, injectMetaIntoHtml } from "./seo-inject";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // The SPA catch-all. Two responsibilities now:
  //   (1) For known routes (including dynamic /condos/:slug etc.), inject
  //       per-page SEO meta tags into the served index.html. Googlebot
  //       gets full HEAD metadata without having to execute JS.
  //   (2) For unknown routes, return a real HTTP 404 with index.html so
  //       Google doesn't soft-404 the entire site.
  const indexPath = path.resolve(distPath, "index.html");
  // Read once at boot; SEO injection runs on every request against this
  // cached template, but file I/O happens once.
  const indexTemplate = fs.readFileSync(indexPath, "utf-8");

  app.use("/{*path}", (req: Request, res: Response) => {
    const meta = metaForPath(req.path);
    if (!meta) {
      // Unknown route: return 404 status with the SPA shell so the in-app
      // NotFound page still renders client-side, but Google treats it as
      // a hard 404 (not a soft-404 of the whole property).
      res.status(404);
      const fallbackHtml = injectMetaIntoHtml(indexTemplate, {
        title: "Page not found — Rivers Real Estate",
        description: "The page you're looking for doesn't exist.",
        canonical: `${process.env.PUBLIC_ORIGIN || "https://riversrealestate.ca"}${req.path}`,
        noindex: true,
      });
      res.set("Content-Type", "text/html; charset=utf-8").send(fallbackHtml);
      return;
    }
    const html = injectMetaIntoHtml(indexTemplate, meta);
    res.set("Content-Type", "text/html; charset=utf-8").send(html);
  });
}
