export function calculateChallengeProgress(
  activityData = [],
  challenge = {}
) {

  const title =
    (
      challenge.title || ""
    ).toLowerCase();

  const description =
    (
      challenge.description || ""
    ).toLowerCase();

  // ======================================
  // UNIQUE SCANS
  // ======================================

  const scanItems =
    activityData.filter(
      (item) =>
        item.type === "scan"
    );

  const uniqueScans =
    Array.from(
      new Map(
        scanItems.map(
          (item) => [
            `${
              item.result || ""
            }_${
              item.created_at || ""
            }`,
            item,
          ]
        )
      ).values()
    );

  // ======================================
  // UNIQUE ACTIONS
  // ======================================

  const actionItems =
    activityData.filter(
      (item) =>
        item.type === "action"
    );

  const uniqueActions =
    Array.from(
      new Map(
        actionItems.map(
          (item) => [
            `${
              item.action_type || item.title || ""
            }_${
              item.created_at || ""
            }`,
            item,
          ]
        )
      ).values()
    );

  // ======================================
  // SCAN CHALLENGE
  // ======================================

  if (
    title.includes("scan") ||
    description.includes("scan")
  ) {

    return uniqueScans.length;
  }

  // ======================================
  // ACTION CHALLENGE
  // ======================================

  if (
    title.includes("aksi") ||
    title.includes("action") ||
    title.includes("reuse") ||
    title.includes("daur ulang") ||
    title.includes("kompos")
  ) {

    return uniqueActions.length;
  }

  return 0;
}