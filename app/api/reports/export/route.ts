import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "transactions"; // "transactions" | "bookings"

  if (type === "transactions") {
    const transactions = await db.transaction.findMany({
      orderBy: { date: "desc" },
      include: { booking: { include: { client: true } } },
    });

    const headers = ["Date", "Type", "Category", "Description", "Amount (RM)", "Client", "Event Type"];
    const rows = transactions.map((t) => [
      `"${formatDate(new Date(t.date))}"`,
      `"${t.type}"`,
      `"${t.category || ""}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      (t.amountCents / 100).toFixed(2),
      `"${t.booking?.client?.name || ""}"`,
      `"${t.booking?.eventType || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flowmotion-transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (type === "bookings") {
    const bookings = await db.booking.findMany({
      orderBy: { eventDate: "desc" },
      include: {
        client: true,
        transactions: { where: { type: "INCOME" } },
      },
    });

    const headers = [
      "Client Name",
      "Contact",
      "Event Type",
      "Event Date",
      "Location",
      "Status",
      "Delivery Status",
      "Total Fee (RM)",
      "Paid (RM)",
      "Balance Due (RM)",
    ];

    const rows = bookings.map((b) => {
      const paidCents = b.transactions.reduce((sum, t) => sum + t.amountCents, 0);
      const balanceCents = b.feeCents - paidCents;

      return [
        `"${b.client.name.replace(/"/g, '""')}"`,
        `"${b.client.contact || ""}"`,
        `"${b.eventType}"`,
        `"${formatDate(new Date(b.eventDate))}"`,
        `"${b.location || ""}"`,
        `"${b.status}"`,
        `"${b.deliveryStatus}"`,
        (b.feeCents / 100).toFixed(2),
        (paidCents / 100).toFixed(2),
        (balanceCents / 100).toFixed(2),
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flowmotion-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
}