/**
 * Works out a member's plan status purely from their latest subscription's
 * end_date — no stored "status" column to keep in sync, so it can never
 * drift out of date.
 *
 * Colors are solid fills (not soft tints) so status reads clearly at a
 * glance; text color is chosen per-fill for proper contrast rather than
 * defaulting to white everywhere (amber needs dark text, not white).
 */
export function getStatusInfo(subscription) {
  if (!subscription) {
    return { label: "No plan", color: "bg-gray-500 text-white" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(subscription.end_date);
  const daysLeft = Math.round((end - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { label: "Expired", color: "bg-pulse-red text-white" };
  }
  if (daysLeft <= 7) {
    return { label: `Expires in ${daysLeft}d`, color: "bg-pulse-amber text-pulse-ink" };
  }
  return { label: "Active", color: "bg-pulse-green text-white" };
}

/** Picks the most recently started subscription from a list. */
export function latestSubscription(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) return null;
  return [...subscriptions].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
}
