import { db } from "./db";
import { formatMoneyCompact } from "./money";
import { formatDate, todayManilaAsUtc } from "./dates";

export interface StudioNotification {
  id: string;
  type: "UPCOMING_SHOOT" | "PAYMENT_DUE" | "DELIVERY_PENDING" | "ACTIVITY" | "CONFLICT";
  title: string;
  message: string;
  category: "Shoots" | "Payments" | "Deliveries" | "Activity";
  priority: "urgent" | "high" | "normal" | "info";
  timestamp: string;
  link: string;
  clientName?: string;
  amountCents?: number;
  daysRemaining?: number;
}

/**
 * Computes dynamic, real-time studio notifications from database state.
 */
export async function getStudioNotifications(): Promise<StudioNotification[]> {
  const today = todayManilaAsUtc();
  const notifications: StudioNotification[] = [];

  // Fetch active bookings, transactions, and client data
  const [activeBookings, recentTransactions] = await Promise.all([
    db.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
      },
      include: {
        client: true,
        transactions: { where: { type: "INCOME" } },
      },
      orderBy: { eventDate: "asc" },
    }),
    db.transaction.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { booking: { include: { client: true } } },
    }),
  ]);

  const datesMap = new Map<string, typeof activeBookings>();

  for (const booking of activeBookings) {
    const paidCents = booking.transactions.reduce((sum, t) => sum + t.amountCents, 0);
    const unpaidCents = booking.feeCents - paidCents;
    const eventTime = new Date(booking.eventDate).getTime();
    const todayTime = today.getTime();
    const diffDays = Math.ceil((eventTime - todayTime) / (1000 * 60 * 60 * 24));
    const dateKey = new Date(booking.eventDate).toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });

    // Group for conflict detection
    if (!datesMap.has(dateKey)) datesMap.set(dateKey, []);
    datesMap.get(dateKey)!.push(booking);

    // 1. Upcoming Shoot alerts (within next 7 days)
    if (diffDays >= 0 && diffDays <= 7 && booking.status !== "COMPLETED") {
      const timeLabel =
        diffDays === 0
          ? "Today"
          : diffDays === 1
          ? "Tomorrow"
          : `in ${diffDays} days (${formatDate(new Date(booking.eventDate))})`;

      notifications.push({
        id: `upcoming-${booking.id}`,
        type: "UPCOMING_SHOOT",
        title: `Upcoming Shoot: ${booking.client.name}`,
        message: `${booking.eventType} scheduled ${timeLabel}${booking.location ? ` at ${booking.location}` : ""}.`,
        category: "Shoots",
        priority: diffDays <= 1 ? "urgent" : "high",
        timestamp: booking.eventDate.toISOString(),
        link: `/bookings/${booking.id}`,
        clientName: booking.client.name,
        daysRemaining: diffDays,
      });
    }

    // 2. Unpaid / Outstanding Balance alerts
    if (unpaidCents > 0) {
      const isPast = diffDays < 0;
      const isSoon = diffDays >= 0 && diffDays <= 5;

      if (isPast || isSoon || booking.status === "CONFIRMED") {
        notifications.push({
          id: `payment-${booking.id}`,
          type: "PAYMENT_DUE",
          title: `Payment Outstanding: ${formatMoneyCompact(unpaidCents)}`,
          message: `${booking.client.name} has ${formatMoneyCompact(unpaidCents)} due for ${booking.eventType} (${formatDate(new Date(booking.eventDate))}).`,
          category: "Payments",
          priority: isPast ? "urgent" : isSoon ? "high" : "normal",
          timestamp: booking.eventDate.toISOString(),
          link: `/bookings/${booking.id}`,
          clientName: booking.client.name,
          amountCents: unpaidCents,
        });
      }
    }

    // 3. Pending Deliverables alerts (Shoot completed or in past, but deliverables not done)
    if (
      (diffDays < 0 || booking.status === "COMPLETED") &&
      booking.deliveryStatus !== "DELIVERED"
    ) {
      notifications.push({
        id: `delivery-${booking.id}`,
        type: "DELIVERY_PENDING",
        title: `Deliverables Pending: ${booking.client.name}`,
        message: `${booking.eventType} photos/videos are marked as "${booking.deliveryStatus.replace(/_/g, " ").toLowerCase()}".`,
        category: "Deliveries",
        priority: booking.deliveryStatus === "NOT_STARTED" ? "high" : "normal",
        timestamp: booking.eventDate.toISOString(),
        link: `/bookings/${booking.id}`,
        clientName: booking.client.name,
      });
    }
  }

  // 4. Schedule Conflict alerts (more than 1 shoot on same day)
  datesMap.forEach((bookingsOnDay, dateStr) => {
    if (bookingsOnDay.length > 1) {
      const names = bookingsOnDay.map((b) => b.client.name).join(", ");
      notifications.push({
        id: `conflict-${dateStr}`,
        type: "CONFLICT",
        title: `Schedule Conflict: ${bookingsOnDay.length} Shoots`,
        message: `Multiple bookings scheduled on ${dateStr}: ${names}.`,
        category: "Shoots",
        priority: "urgent",
        timestamp: new Date(dateStr).toISOString(),
        link: `/calendar`,
      });
    }
  });

  // 5. Recent Transaction / Activity notifications
  for (const tx of recentTransactions) {
    if (tx.type === "INCOME") {
      notifications.push({
        id: `activity-${tx.id}`,
        type: "ACTIVITY",
        title: `Payment Received: +${formatMoneyCompact(tx.amountCents)}`,
        message: `${tx.description} logged on ${formatDate(new Date(tx.date))}.`,
        category: "Activity",
        priority: "info",
        timestamp: tx.date.toISOString(),
        link: tx.bookingId ? `/bookings/${tx.bookingId}` : `/wages`,
      });
    }
  }

  // Sort: urgent first, then high, normal, info, and by date
  const priorityOrder = { urgent: 0, high: 1, normal: 2, info: 3 };
  return notifications.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}