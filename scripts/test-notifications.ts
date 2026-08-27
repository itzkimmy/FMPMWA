import "dotenv/config";
import { getStudioNotifications } from "../lib/notifications";
import { db } from "../lib/db";

async function runTest() {
  console.log("=========================================");
  console.log("🧪 TESTING STUDIO NOTIFICATION ENGINE");
  console.log("=========================================\n");

  // Fetch current notifications
  const notifications = await getStudioNotifications();

  console.log(`Found ${notifications.length} active studio notification(s):\n`);

  notifications.forEach((n, idx) => {
    console.log(`[${idx + 1}] Type: ${n.type} | Priority: ${n.priority.toUpperCase()} | Category: ${n.category}`);
    console.log(`    Title: ${n.title}`);
    console.log(`    Message: ${n.message}`);
    console.log(`    Link: ${n.link}`);
    console.log("-----------------------------------------");
  });

  console.log("\n✅ NOTIFICATION ENGINE TEST COMPLETE!");
}

runTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });