// A-Player Workspace Assessment — lead capture endpoint.
// Stores one JSON document per submission in the private
// `workspace-valet-leads` Vercel Blob store.
import { put } from "@vercel/blob";

const REQUIRED = ["firstName", "email", "answers", "totalPoints", "resultProfile"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  for (const field of REQUIRED) {
    if (body[field] === undefined || body[field] === "") {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const record = {
    timestamp: new Date().toISOString(),
    firstName: String(body.firstName).slice(0, 100),
    email: String(body.email).toLowerCase().slice(0, 200),
    role: String(body.role || "").slice(0, 100),
    desiredOutcome: String(body.desiredOutcome || "").slice(0, 200),
    obstacles: Array.isArray(body.obstacles) ? body.obstacles.slice(0, 10) : [],
    obstacleOther: String(body.obstacleOther || "").slice(0, 250),
    answers: body.answers,
    totalPoints: Number(body.totalPoints),
    percentage: Number(body.percentage),
    dimensionScores: body.dimensionScores || {},
    resultProfile: String(body.resultProfile).slice(0, 100),
    lowestDimension: String(body.lowestDimension || "").slice(0, 100),
    utm: body.utm || {},
    userAgent: String(req.headers["user-agent"] || "").slice(0, 300)
  };

  const safeEmail = record.email.replace(/[^a-z0-9@._-]/g, "");
  const key = `leads/${record.timestamp.replace(/[:.]/g, "-")}_${safeEmail}.json`;

  await put(key, JSON.stringify(record, null, 2), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json"
  });

  return res.status(200).json({ ok: true });
}
