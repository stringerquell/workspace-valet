// Lead export — returns all assessment submissions as JSON or CSV.
// Protected by LEADS_EXPORT_KEY. Usage:
//   /api/leads?key=KEY          → JSON
//   /api/leads?key=KEY&format=csv → CSV (imports into Sheets/Excel)
import { list } from "@vercel/blob";

const CSV_COLUMNS = [
  "timestamp", "firstName", "email", "role", "desiredOutcome", "serviceTiming",
  "obstacles", "obstacleOther", "totalPoints", "percentage", "resultProfile",
  "lowestDimension", "presentation", "careSystem", "stewardship",
  "utm_source", "utm_medium", "utm_campaign"
];

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default async function handler(req, res) {
  if (!process.env.LEADS_EXPORT_KEY || req.query.key !== process.env.LEADS_EXPORT_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const leads = [];
  let cursor;
  do {
    const page = await list({ prefix: "leads/", cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const r = await fetch(blob.downloadUrl || blob.url);
      if (r.ok) leads.push(await r.json());
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  leads.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  if (req.query.format === "csv") {
    const rows = leads.map(l => [
      l.timestamp, l.firstName, l.email, l.role, l.desiredOutcome, l.serviceTiming,
      (l.obstacles || []).join("; "), l.obstacleOther, l.totalPoints,
      l.percentage, l.resultProfile, l.lowestDimension,
      l.dimensionScores?.presentation, l.dimensionScores?.careSystem,
      l.dimensionScores?.stewardship, l.utm?.utm_source, l.utm?.utm_medium,
      l.utm?.utm_campaign
    ].map(csvCell).join(","));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=workspace-valet-leads.csv");
    return res.status(200).send([CSV_COLUMNS.join(","), ...rows].join("\n"));
  }

  return res.status(200).json({ count: leads.length, leads });
}
