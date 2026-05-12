// routes/aiRoomQuery.js
// ─────────────────────────────────────────────────────────────────────────────
// POST /booking/api/ai/room-query
//
// Accepts a natural language question, sends it to Claude Haiku to extract
// search intent (seaterType, fee range, sort order), then queries MongoDB
// and returns enriched room data.
//
// Rate limit: 10 requests per minute per IP.
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { Room, Booking } from "../data/rooms.js";

const router = express.Router();

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// 10 requests per minute per IP address
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 10,                   // max 10 requests per window
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI queries from this IP. Please wait a minute and try again.",
    retryAfter: 60,
  },
  keyGenerator: ipKeyGenerator, // IPv6-safe built-in helper
});

// ─── Anthropic client (lazy — initialised on first request) ───────────────────
let anthropicClient = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return null; // Caller handles missing key
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a hostel room search assistant. Your job is to extract structured search intent from a user's natural language question about hostel rooms.

Room schema (MongoDB):
- roomNumber: string (e.g. "101", "A2")
- seaterType: number — MUST be 2, 3, or 4 (the number of beds in the room)
- price: number — monthly fee in Indian Rupees (₹)
- status: "Available" | "Full"

Extract the user's intent and return ONLY a valid JSON object with this exact shape — no explanation, no markdown, no code fences:

{
  "seaterType": null,
  "minFee": null,
  "maxFee": null,
  "statusFilter": null,
  "sortBy": null,
  "sortOrder": "asc"
}

Field rules:
- seaterType: set to 2, 3, or 4 if the user mentions number of beds/seats/sharing. null otherwise.
- minFee: set to a number if user mentions a minimum price/fee/rent. null otherwise.
- maxFee: set to a number if user mentions a maximum/upper price/fee/rent. null otherwise.
- statusFilter: set to "Available" if user only wants available rooms, "Full" if only full rooms. null for no filter.
- sortBy: "price" if user wants sorted by price/fee/cost, "roomNumber" if sorted by room number. null if no sort mentioned.
- sortOrder: "asc" for ascending/cheapest/lowest, "desc" for descending/most expensive/highest. Default "asc".

Examples:
- "show 3-seater rooms under 5000" → {"seaterType":3,"minFee":null,"maxFee":5000,"statusFilter":null,"sortBy":null,"sortOrder":"asc"}
- "cheapest available 2 bed rooms" → {"seaterType":2,"minFee":null,"maxFee":null,"statusFilter":"Available","sortBy":"price","sortOrder":"asc"}
- "4 sharing rooms sorted by price descending" → {"seaterType":4,"minFee":null,"maxFee":null,"statusFilter":null,"sortBy":"price","sortOrder":"desc"}
- "all available rooms between 3000 and 8000" → {"seaterType":null,"minFee":3000,"maxFee":8000,"statusFilter":"Available","sortBy":null,"sortOrder":"asc"}`;

// ─── Intent extraction via Claude Haiku ───────────────────────────────────────
async function extractIntent(question) {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  // Extract text from response
  const rawText = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  // Parse JSON — strip any accidental markdown fences
  const jsonStr = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const intent = JSON.parse(jsonStr);

  return intent;
}

// ─── Build MongoDB query from intent ─────────────────────────────────────────
function buildMongoQuery(intent) {
  const filter = {};
  const sort = {};

  // seaterType filter
  if (intent.seaterType !== null && [2, 3, 4].includes(Number(intent.seaterType))) {
    filter.seaterType = Number(intent.seaterType);
  }

  // price range filter
  if (intent.minFee !== null || intent.maxFee !== null) {
    filter.price = {};
    if (intent.minFee !== null && Number.isFinite(Number(intent.minFee))) {
      filter.price.$gte = Number(intent.minFee);
    }
    if (intent.maxFee !== null && Number.isFinite(Number(intent.maxFee))) {
      filter.price.$lte = Number(intent.maxFee);
    }
  }

  // sort
  if (intent.sortBy === "price") {
    sort.price = intent.sortOrder === "desc" ? -1 : 1;
  } else if (intent.sortBy === "roomNumber") {
    sort.roomNumber = intent.sortOrder === "desc" ? -1 : 1;
  }

  return { filter, sort };
}

// ─── Enrich rooms with live occupancy (mirrors getOccupancyData) ──────────────
async function enrichWithOccupancy(rooms, statusFilter) {
  const enriched = await Promise.all(
    rooms.map(async (room) => {
      const occupiedSeats = await Booking.countDocuments({
        roomNumber: room.roomNumber,
        status: "Approved",
      });
      const seatsLeft = Math.max(room.totalSeats - occupiedSeats, 0);
      const status = seatsLeft > 0 ? "Available" : "Full";

      return {
        _id: room._id,
        roomNumber: room.roomNumber,
        seaterType: room.seaterType,
        totalSeats: room.totalSeats,
        monthlyFee: room.price,
        occupiedSeats,
        seatsLeft,
        status,
      };
    })
  );

  // Apply status filter post-enrichment (status is derived, not stored reliably)
  if (statusFilter === "Available" || statusFilter === "Full") {
    return enriched.filter((r) => r.status === statusFilter);
  }

  return enriched;
}

// ─── POST /booking/api/ai/room-query ─────────────────────────────────────────
router.post("/room-query", aiRateLimiter, async (req, res) => {
  // 1. Input validation
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      success: false,
      message: "A 'question' string is required in the request body.",
    });
  }

  const trimmed = question.trim();
  if (!trimmed) {
    return res.status(400).json({
      success: false,
      message: "The 'question' field must not be empty.",
    });
  }
  if (trimmed.length > 500) {
    return res.status(400).json({
      success: false,
      message: "The 'question' field must be 500 characters or less.",
    });
  }

  // 2. Check API key availability early
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[AI Room Query] ANTHROPIC_API_KEY is not set.");
    return res.status(503).json({
      success: false,
      message: "AI service is not configured. Please set ANTHROPIC_API_KEY.",
    });
  }

  try {
    // 3. Extract intent via Claude Haiku
    console.log(`[AI Room Query] Question: "${trimmed}" | IP: ${req.ip}`);
    const intent = await extractIntent(trimmed);
    console.log("[AI Room Query] Extracted intent:", intent);

    // 4. Build and execute MongoDB query
    const { filter, sort } = buildMongoQuery(intent);
    console.log("[AI Room Query] MongoDB filter:", filter, "| sort:", sort);

    const rooms = await Room.find(filter).sort(Object.keys(sort).length ? sort : { roomNumber: 1 });

    // 5. Enrich with live occupancy + apply status filter
    const enrichedRooms = await enrichWithOccupancy(rooms, intent.statusFilter);

    // 6. Respond
    res.json({
      success: true,
      question: trimmed,
      intent,
      count: enrichedRooms.length,
      data: enrichedRooms,
    });
  } catch (err) {
    // Claude JSON parse failure
    if (err instanceof SyntaxError) {
      console.error("[AI Room Query] Failed to parse Claude response as JSON:", err.message);
      return res.status(502).json({
        success: false,
        message: "AI returned an unexpected response. Please rephrase your question.",
      });
    }

    // Claude API errors (auth, quota, network)
    if (err.status === 401) {
      return res.status(503).json({
        success: false,
        message: "AI service authentication failed. Check ANTHROPIC_API_KEY.",
      });
    }
    if (err.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI service rate limit reached. Please try again shortly.",
      });
    }

    console.error("[AI Room Query] Unexpected error:", err);
    res.status(500).json({
      success: false,
      message: "An internal error occurred while processing your query.",
    });
  }
});

export default router;
