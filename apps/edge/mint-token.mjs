// Mint a session token for the WS auth gate.
//   node --experimental-transform-types mint-token.mjs <secret> <sub> [days]
// <sub> must equal the path id: the sessionId for /authoring/:id, the formId for
// /forms/:id. Use this to generate the studio's VITE_SESSION_TOKEN or for testing.
const [, , secret, sub, days = "30"] = process.argv;
if (!secret || !sub) {
  console.error("usage: node --experimental-transform-types mint-token.mjs <secret> <sub> [days]");
  process.exit(1);
}
const { signSessionToken } = await import("./src/auth.ts");
const exp = Math.floor(Date.now() / 1000) + Number(days) * 86400;
console.log(await signSessionToken(secret, { sub, exp }));
