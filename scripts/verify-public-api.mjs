const endpoints = [
  ["catalog", "../api/catalog.js"],
  ["status", "../api/status.js"],
  ["proof", "../api/proof.js"],
];

function createResponse(name) {
  return {
    code: 0,
    body: null,
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      if (this.code !== 200 || body?.ok !== true) {
        throw new Error(`${name} returned invalid response`);
      }
    },
  };
}

for (const [name, path] of endpoints) {
  const handler = (await import(path)).default;
  const response = createResponse(name);
  await handler({}, response);
  console.log(`${name}: ok`);
}

const { default: runDemo } = await import("../api/run-demo.js");
const fakeRequest = {
  method: "POST",
  on(event, callback) {
    if (event === "data") {
      callback(Buffer.from(JSON.stringify({ productSummary: "verify public demo" })));
    }
    if (event === "end") {
      callback();
    }
  },
};
const runResponse = createResponse("run-demo");
await runDemo(fakeRequest, runResponse);
if (!Array.isArray(runResponse.body.events) || runResponse.body.events.length < 3) {
  throw new Error("run-demo did not return runtime events");
}
console.log("run-demo: ok");
console.log("public API verification complete");
