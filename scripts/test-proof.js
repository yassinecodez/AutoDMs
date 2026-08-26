const crypto = require("crypto");

const token = "IGAAOy0ZBysU1FBZAFp0eENWZAWxyRDNvaGFEZAHZAGSEZAMc0h0bkR6YUhMUnV6ZADg0T1lqZA2dMUDl3cnhpblZASbk80U21vVUp2NVpQOWVjOHZAUa3p4a29uUUlXUkdFSEV2N1h3T2s1Y3FzVnJvdjF2eFd0OUFsa1psTkVnd3cZD";
const appSecret = "41fed97dd8c8940e7b929984d3f16a5f";

const appsecretProof = crypto.createHmac("sha256", appSecret).update(token).digest("hex");

async function testWithProof() {
  const urls = [
    `https://graph.instagram.com/me?fields=id,username,name&access_token=${token}&appsecret_proof=${appsecretProof}`,
    `https://graph.instagram.com/v24.0/me?fields=id,username,name&access_token=${token}&appsecret_proof=${appsecretProof}`,
    `https://graph.instagram.com/37760646346917256?fields=id,username,name&access_token=${token}&appsecret_proof=${appsecretProof}`,
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`URL: ${u}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${await res.text()}\n`);
    } catch (e) {
      console.log("Err:", e.message);
    }
  }
}

testWithProof();
