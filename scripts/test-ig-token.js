const token = "IGAAOy0ZBysU1FBZAFp0eENWZAWxyRDNvaGFEZAHZAGSEZAMc0h0bkR6YUhMUnV6ZADg0T1lqZA2dMUDl3cnhpblZASbk80U21vVUp2NVpQOWVjOHZAUa3p4a29uUUlXUkdFSEV2N1h3T2s1Y3FzVnJvdjF2eFd0OUFsa1psTkVnd3cZD";
const userId = "37760646346917256";

async function testIgEndpoints() {
  const urls = [
    `https://graph.instagram.com/me?access_token=${token}`,
    `https://graph.instagram.com/v24.0/me?access_token=${token}`,
    `https://graph.instagram.com/${userId}?access_token=${token}`,
    `https://graph.instagram.com/v24.0/${userId}?access_token=${token}`,
    `https://graph.instagram.com/me?fields=username&access_token=${token}`,
    `https://graph.instagram.com/v24.0/me?fields=username&access_token=${token}`,
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`URL: ${u}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${await res.text()}\n`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testIgEndpoints();
