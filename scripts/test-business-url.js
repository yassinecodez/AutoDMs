const appId = "954476037671354";
const configId = "3012437062432078";
const redirectUri = "https://autodms-project.vercel.app/api/auth/facebook/callback";

const params = new URLSearchParams({
  client_id: appId,
  config_id: configId,
  redirect_uri: redirectUri,
  response_type: "code",
  extras: JSON.stringify({ setup: { channel: "IG_API_ONBOARDING" } }),
  state: "test_state"
});

const businessUrl = `https://business.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
console.log("Business OAuth URL:\n", businessUrl);
