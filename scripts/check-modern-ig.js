const clientId = "954476037671354";
const redirectUri = "https://autodms-project.vercel.app/api/auth/instagram/callback";

const url = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments`;

console.log("Modern Instagram Business OAuth URL with App 954476037671354:\n", url);
