#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generates a typed frontend client from a Swagger/OpenAPI spec.
 * Uses openapi-typescript-codegen (pure TypeScript, no Java required).
 *
 * Usage:
 *   NEXT_PUBLIC_OPENAPI_URL="http://localhost:5000/api/docs" npm run generate
 *   # or provide path/URL as arg
 *   npm run generate -- http://localhost:5000/api/docs
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const normalizeSpecInput = (value) => {
  if (!value) return null;
  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.endsWith(".json")) return trimmed;
  if (trimmed.endsWith("/docs")) return `${trimmed}.json`;
  return trimmed;
};

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
};

const tryFetchSpec = async (baseUrl) => {
  const urlsToTry = [
    baseUrl.endsWith(".json") ? baseUrl : `${baseUrl}.json`,
    baseUrl.replace(/\/docs$/, "/docs.json"),
    baseUrl.replace(/\/docs$/, "/swagger.json"),
    baseUrl.replace(/\/docs$/, "/openapi.json"),
  ];

  for (const url of urlsToTry) {
    try {
      console.log(`Trying to fetch: ${url}`);
      const data = await fetchUrl(url);
      const parsed = JSON.parse(data);
      if (parsed.openapi || parsed.swagger) {
        console.log(`✓ Successfully fetched spec from: ${url}`);
        return { url, data };
      }
    } catch (err) {
      console.log(`✗ Failed: ${err.message}`);
      continue;
    }
  }
  throw new Error(
    `Could not fetch OpenAPI spec from any of: ${urlsToTry.join(", ")}`
  );
};

const specInput = normalizeSpecInput(
  process.env.NEXT_PUBLIC_OPENAPI_URL || process.argv[2]
);
const outputDir = path.resolve(__dirname, "../app/api/generated");

if (!specInput) {
  console.error(
    "Missing spec. Set NEXT_PUBLIC_OPENAPI_URL in .env or pass a URL/path as an argument."
  );
  process.exit(1);
}

// Clean previous output to avoid stale types.
fs.rmSync(outputDir, { recursive: true, force: true });

(async () => {
  let specFile = specInput;
  const tempFile = path.join(__dirname, "../.openapi-spec.json");

  // If it's a URL, fetch it first
  if (specInput.startsWith("http://") || specInput.startsWith("https://")) {
    try {
      console.log(`Fetching OpenAPI spec from: ${specInput}`);
      const { data } = await tryFetchSpec(specInput);
      fs.writeFileSync(tempFile, data, "utf8");
      specFile = tempFile;
      console.log(`Saved spec to temporary file: ${tempFile}`);
    } catch (err) {
      console.error(`Error fetching spec: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`Generating client from spec: ${specFile}`);
  console.log(`Output directory: ${outputDir}`);

  // Verify spec file exists
  if (!fs.existsSync(specFile)) {
    console.error(`Error: Spec file does not exist: ${specFile}`);
    process.exit(1);
  }

  // Verify npx is available
  const npxCheck = spawnSync("npx", ["--version"], {
    stdio: "pipe",
    shell: true,
  });
  if (npxCheck.error || npxCheck.status !== 0) {
    console.error(
      "Error: npx is not available. Please ensure Node.js and npm are installed."
    );
    if (npxCheck.error) {
      console.error(`Details: ${npxCheck.error.message}`);
    }
    process.exit(1);
  }

  // Use openapi-typescript-codegen (no Java required) instead of openapi-generator-cli
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "openapi-typescript-codegen",
      "--input",
      specFile,
      "--output",
      outputDir,
      "--client",
      "axios",
      "--useOptions",
      "--useUnionTypes",
    ],
    {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
      shell: true, // Use shell for better cross-platform compatibility
    }
  );

  // Clean up temp file
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }

  if (result.error) {
    console.error(`Error executing npx: ${result.error.message}`);
    if (result.error.code === "ENOENT") {
      console.error(
        "npx command not found. Please ensure Node.js and npm are installed and in your PATH."
      );
    }
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`OpenAPI generation failed with exit code ${result.status}.`);
    if (result.signal) {
      console.error(`Process was killed by signal: ${result.signal}`);
    }
    process.exit(result.status ?? 1);
  }

  console.log("API client generated successfully.");
})();
