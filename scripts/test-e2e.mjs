import assert from "node:assert/strict";

async function testHttpEndpoints() {
  console.log("1. Testing unauthenticated request to / -> should redirect to /login");
  const res1 = await fetch("http://localhost:3000/", { redirect: "manual" });
  assert.equal(res1.status, 307);
  assert.ok(res1.headers.get("location")?.includes("/login"));
  console.log("✓ Unauthenticated redirect passed!");

  console.log("\n2. Testing login with incorrect passphrase");
  const res2 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase: "wrongpassword" }),
  });
  assert.equal(res2.status, 401);
  const data2 = await res2.json();
  assert.equal(data2.ok, false);
  console.log("✓ Incorrect passphrase rejected!");

  console.log("\n3. Testing login with correct passphrase 'studio123'");
  const res3 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase: "studio123" }),
  });
  assert.equal(res3.status, 200);
  const cookieHeader = res3.headers.get("set-cookie");
  assert.ok(cookieHeader && cookieHeader.includes("studioledger_session="));
  const sessionCookie = cookieHeader.split(";")[0];
  console.log("✓ Login successful and session cookie issued!");

  console.log("\n4. Testing authenticated requests to all routes");
  const routes = [
    "/",
    "/bookings",
    "/bookings/new",
    "/clients",
    "/clients/new",
    "/wages",
    "/calendar",
    "/settings",
  ];

  for (const route of routes) {
    const res = await fetch(`http://localhost:3000${route}`, {
      headers: { Cookie: sessionCookie },
    });
    assert.equal(res.status, 200, `Route ${route} returned status ${res.status}`);
    const html = await res.text();
    assert.ok(html.includes("StudioLedger"), `Route ${route} rendered StudioLedger layout`);
    console.log(`✓ Route ${route} rendered successfully (status 200)`);
  }

  console.log("\nAll HTTP end-to-end endpoint tests passed completely!");
}

testHttpEndpoints().catch((e) => {
  console.error("HTTP test failed:", e);
  process.exit(1);
});
