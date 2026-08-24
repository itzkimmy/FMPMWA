import { db } from "../lib/db";
import { manilaDateToUtc } from "../lib/dates";

async function main() {
  console.log("Seeding StudioLedger database...");

  // Clean existing records
  await db.transaction.deleteMany();
  await db.booking.deleteMany();
  await db.client.deleteMany();
  await db.settings.deleteMany();

  // Seed default rate card
  await db.settings.create({
    data: {
      key: "rate_card",
      value: JSON.stringify({
        photographyHalfDay: 150000, // RM 1,500
        photographyFullDay: 280000, // RM 2,800
        videographyHalfDay: 180000, // RM 1,800
        videographyFullDay: 350000, // RM 3,500
        portraitSession: 45000, // RM 450
        additionalHour: 25000, // RM 250
        rushFee: 30000, // RM 300
        extraEdits: 10000, // RM 100
        notes: "Rates include standard color grading and high-res digital delivery within 14 days.",
      }),
    },
  });

  // Seed clients
  const client1 = await db.client.create({
    data: {
      name: "Aiman & Nurul H.",
      contact: "aiman@example.my · +60 12-345 6789",
      source: "Instagram",
      notes: "Wedding at Glasshouse at Seputeh, KL. Warm cinematic aesthetic.",
    },
  });

  const client2 = await db.client.create({
    data: {
      name: "Hannah Tan",
      contact: "hannah@example.my",
      source: "Referral",
      notes: "Editorial portrait session for upcoming brand campaign.",
    },
  });

  const client3 = await db.client.create({
    data: {
      name: "Nexus Media Sdn Bhd",
      contact: "production@nexus.my · +60 3-8888 1234",
      source: "Repeat client",
      notes: "Quarterly corporate executive headshots and behind-the-scenes video.",
    },
  });

  const client4 = await db.client.create({
    data: {
      name: "Sarah Lim",
      contact: "sarah@example.my",
      source: "Instagram",
      notes: "Fashion lookbook and product reels.",
    },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  // Booking 1: Confirmed Wedding upcoming in 5 days (Deposit paid, balance pending -> Payment Watch trigger)
  const b1Date = manilaDateToUtc(`${currentYear}-${currentMonth}-28`);
  const b1 = await db.booking.create({
    data: {
      clientId: client1.id,
      eventType: "Wedding",
      eventDate: b1Date,
      location: "Glasshouse at Seputeh, Kuala Lumpur",
      feeCents: 450000, // RM 4,500
      depositCents: 150000, // RM 1,500
      status: "CONFIRMED",
      deliveryStatus: "NOT_STARTED",
      notes: "Full day coverage, 2 shooters. Sunset ceremony at 5:00 PM.",
    },
  });

  // Deposit transaction for booking 1
  await db.transaction.create({
    data: {
      bookingId: b1.id,
      type: "INCOME",
      amountCents: 150000,
      category: "Booking payment",
      description: "Wedding reservation deposit - Aiman & Nurul",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Booking 2: Confirmed shoot on same day (simulating conflict detection)
  await db.booking.create({
    data: {
      clientId: client2.id,
      eventType: "Portrait",
      eventDate: b1Date,
      location: "Studio 24, Petaling Jaya",
      feeCents: 65000, // RM 650
      depositCents: 20000,
      status: "CONFIRMED",
      deliveryStatus: "NOT_STARTED",
      notes: "Morning session from 9:00 AM to 11:00 AM.",
    },
  });

  // Booking 3: Completed shoot in editing
  const b3Date = manilaDateToUtc(`${currentYear}-${currentMonth}-10`);
  const b3 = await db.booking.create({
    data: {
      clientId: client3.id,
      eventType: "Corporate",
      eventDate: b3Date,
      location: "KL Sentral, Kuala Lumpur",
      feeCents: 280000, // RM 2,800
      depositCents: 100000,
      status: "COMPLETED",
      deliveryStatus: "EDITING",
      notes: "20 headshots + 1-min recap reel. Selection gallery sent to client.",
    },
  });

  // Full payment transaction for booking 3
  await db.transaction.create({
    data: {
      bookingId: b3.id,
      type: "INCOME",
      amountCents: 280000,
      category: "Booking payment",
      description: "Full payment - Nexus Media Sdn Bhd Executive Headshots",
      date: b3Date,
    },
  });

  // Booking 4: Inquiry
  const b4Date = manilaDateToUtc(`${currentYear}-${currentMonth}-30`);
  await db.booking.create({
    data: {
      clientId: client4.id,
      eventType: "Product",
      eventDate: b4Date,
      location: "Bangsar Studio",
      feeCents: 120000,
      depositCents: 40000,
      status: "INQUIRY",
      deliveryStatus: "NOT_STARTED",
      notes: "Inquired about summer collection flat lays and model shots.",
    },
  });

  // Studio expenses for the current month
  await db.transaction.create({
    data: {
      type: "EXPENSE",
      amountCents: 25000, // RM 250
      category: "Software",
      description: "Adobe Creative Cloud + Lightroom subscription",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await db.transaction.create({
    data: {
      type: "EXPENSE",
      amountCents: 40000, // RM 400
      category: "Assistant",
      description: "Second shooter day rate - Corporate shoot",
      date: b3Date,
    },
  });

  console.log("Database seeded successfully with sample clients, bookings, transactions, and rate card!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
