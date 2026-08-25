async function testLive() {
  const r1 = await fetch("https://autodms-project.vercel.app/api/auth/instagram/url");
  console.log("Status /api/auth/instagram/url:", r1.status, await r1.text());

  const r2 = await fetch("https://autodms-project.vercel.app/api/auth/facebook/url");
  console.log("Status /api/auth/facebook/url:", r2.status, await r2.text());
}

testLive();
