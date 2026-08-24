import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  console.log("Resetting database to a clean, fresh state...");

  // Delete all demo transactions, bookings, and clients
  await db.transaction.deleteMany();
  await db.booking.deleteMany();
  await db.client.deleteMany();
  await db.settings.deleteMany();

  // Initialize fresh studio default settings
  await db.settings.createMany({
    data: [
      { key: "currency", value: "MYR" },
      { key: "defaultDepositPercent", value: "30" },
      { key: "defaultDueDays", value: "14" },
      {
        key: "rate_card",
        value: JSON.stringify({
          photographyHalfDay: 150000,
          photographyFullDay: 280000,
          videographyHalfDay: 180000,
          videographyFullDay: 350000,
          portraitSession: 45000,
          additionalHour: 25000,
          rushFee: 30000,
          extraEdits: 10000,
          notes: "Standard studio rates in Malaysian Ringgit (RM).",
        }),
      },
    ],
  });

  console.log("Database reset complete! All demo clients and bookings cleared. Fresh studio configuration ready.");
}

main()
  .catch((e) => {
    console.error("Reset error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });