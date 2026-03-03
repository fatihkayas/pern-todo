import app from "./app";
import { initKafka } from "./lib/kafka";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initKafka();
    console.log("✅ Kafka producer connected");

    app.listen(PORT, () => {
      console.log(`🚀 Backend ${PORT} portunda hazır.`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();