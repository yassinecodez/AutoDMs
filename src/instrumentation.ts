export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Instrumentation] Starting BullMQ workers in Node.js runtime environment...");
    try {
      const { startWorker } = await import("./lib/queue");
      startWorker();
    } catch (error) {
      console.error("[Instrumentation] Failed to register and start BullMQ workers:", error);
    }
  }
}
