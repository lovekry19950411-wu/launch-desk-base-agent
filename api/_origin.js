export function getOrigin(request) {
  const headers = request?.headers ?? {};
  const forwardedProto = headers["x-forwarded-proto"];
  const host = headers["x-forwarded-host"] || headers.host;
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || "https";

  if (!host) {
    return process.env.PUBLIC_BASE_URL || "http://127.0.0.1:8788";
  }

  if (host.startsWith("127.0.0.1") || host.startsWith("localhost")) {
    return `http://${host}`;
  }

  return `${proto}://${host}`;
}
