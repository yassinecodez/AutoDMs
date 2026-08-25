async function diag() {
  const res = await fetch("https://autodms-project.vercel.app/api/diagnostic");
  console.log("Diagnostic Status:", res.status);
  console.log("Diagnostic Body:", await res.text());
}
diag();
