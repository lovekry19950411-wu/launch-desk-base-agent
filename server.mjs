import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import catalogHandler from "./api/catalog.js";
import proofHandler from "./api/proof.js";
import runDemoHandler from "./api/run-demo.js";
import statusHandler from "./api/status.js";

const app = express();
const rootDir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8788);

app.disable("x-powered-by");

app.get("/api/status", statusHandler);
app.get("/api/catalog", catalogHandler);
app.get("/api/proof", proofHandler);
app.all("/api/run-demo", runDemoHandler);

app.get("/openapi.json", (_request, response) => {
  response.sendFile(join(rootDir, "openapi.json"));
});

app.get("/owner-deploy", (_request, response) => {
  response.sendFile(join(rootDir, "owner-deploy.html"));
});

app.use(
  express.static(rootDir, {
    extensions: ["html"],
    setHeaders(response) {
      response.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

app.use((_request, response) => {
  response.sendFile(join(rootDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Launch Desk Base Agent running on http://127.0.0.1:${port}`);
});
