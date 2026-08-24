import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactionSchema } from "@/lib/validation";
import { parseMoneyCents } from "@/lib/money";
import { manilaDateToUtc } from "@/lib/dates";

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Validation error";
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    const { bookingId, type, amountInput, category, description, date } =
      parsed.data;

    const amountCents = parseMoneyCents(amountInput);
    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const transaction = await db.transaction.create({
      data: {
        bookingId: bookingId || null,
        type,
        amountCents,
        category: category || null,
        description,
        date: manilaDateToUtc(date),
      },
    });

    return NextResponse.json({ ok: true, data: transaction });
  } catch (err) {
    console.error("[POST /api/transactions]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;

    const whereDate = month
      ? {
          date: {
            gte: new Date(`${month}-01T00:00:00+08:00`),
            lt: new Date(
              `${parseInt(month.slice(5)) === 12 ? parseInt(month.slice(0, 4)) + 1 : parseInt(month.slice(0, 4))}-${
                parseInt(month.slice(5)) === 12 ? "01" : String(parseInt(month.slice(5)) + 1).padStart(2, "0")
              }-01T00:00:00+08:00`
            ),
          },
        }
      : {};

    const transactions = await db.transaction.findMany({
      where: {
        ...(type ? { type } : {}),
        ...whereDate,
      },
      include: { booking: { include: { client: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ ok: true, data: transactions });
  } catch (err) {
    console.error("[GET /api/transactions]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
