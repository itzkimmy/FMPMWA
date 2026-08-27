import "dotenv/config";
import { getStudioNotifications } from "../lib/notifications";
import { db } from "../lib/db";
import { todayManilaAsUtc } from "../lib/dates";

async function runTestWithDummy() {
  console.log("=========================================");
  console.log("🧪 TESTING NOTIFICATIONS WITH DUMMY DATA");
  console.log("=========================================\n");

  const today = todayManilaAsUtc();
  const shootDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

  console.log("1. Creating dummy test client and booking...");
  const client = await db.client.create({
    data: {
      name: "Test: Maya & Ryan",
      contact: "+60 12-987 6543",
      source: "Instagram",
    },
  });

  const booking = await db.booking.create({
    data: {
      clientId: client.id,
      eventType: "Wedding Ceremony",
      eventDate: shootDate,
      location: "Glasshouse Seputeh, KL",
      feeCents: 450000, // RM 4,500
      depositCents: 150000, // RM 1,500
      status: "CONFIRMED",
      deliveryStatus: "NOT_STARTED",
    },
  });

  // Log partial payment
  await db.transaction.create({
    data: {
      bookingId: booking.id,
      type: "INCOME",
      amountCents: 150000, // RM 1,500 paid, RM 3,000 balance due
      category: "Deposit received",
      description: "Deposit from Maya & Ryan",
      date: today,
    },
  });

  console.log("2. Fetching studio notifications from engine...\n");
  const notifications = await getStudioNotifications();

  console.log(`Found ${notifications.length} notification(s) generated:\n`);
  notifications.forEach((n, idx) => {
    console.log(`[Notification ${idx + 1}]`);
    console.log(`  🏷️  Title:    ${n.title}`);
    console.log(`  💬 Message:  ${n.message}`);
    console.log(`  📂 Category: ${n.category}`);
    console.log(`  ⚡ Priority: ${n.priority.toUpperCase()}`);
    console.log(`  🔗 Link:     ${n.link}`);
    console.log("-----------------------------------------");
  });

  const hasUpcoming = notifications.some((n) => n.type === "UPCOMING_SHOOT");
  const hasPayment = notifications.some((n) => n.type === "PAYMENT_DUE");

  if (hasUpcoming && hasPayment) {
    console.log("\n🎉 TEST PASSED: Upcoming shoot & Outstanding payment notifications detected successfully!");
  } else {
    console.log("\n⚠️ Partial match - check notification filtering conditions.");
  }
}

runTestWithDummy()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });