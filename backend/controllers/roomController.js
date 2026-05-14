const Room = require("../models/Room");
const OpenAI = require("openai");

const openAiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openai = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;

function getFreeSeats(room) {
  return Math.max((room.totalSeats || 0) - (room.occupiedSeats || 0), 0);
}

async function generateAssistantMessage(query, parsed, rooms, sqlEquivalent) {
  if (!openai) return null;

  const topRooms = rooms.slice(0, 5).map((room, index) => {
    return `${index + 1}. Room #${room.roomNumber} - ${room.seaterType}-Seater - Rs.${room.monthlyFee}/month - ${getFreeSeats(room)} free seat(s) - ${room.status}`;
  });

  const roomSummary = topRooms.length
    ? `Top matching rooms:\n${topRooms.join("\n")}`
    : "No matching rooms found.";

  const messages = [
    {
      role: "system",
      content:
        "You are a concise room-search assistant for Shikha Girls Hostel. Use the parsed filters and room list as source of truth. Recommend practical options, mention room numbers, price, seat type, free seats, and explain why they match. If no exact match exists, suggest the closest available alternative. Do not invent rooms or policies.",
    },
    {
      role: "user",
      content: `User query: "${query}"\n\nParsed filters: ${JSON.stringify(parsed.filter)}\nQuery plan: ${sqlEquivalent}\nSearch summary: ${parsed.summary}\n${roomSummary}`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: openAiModel,
      messages,
      max_tokens: 650,
      temperature: 0.35,
    });

    return response?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("OpenAI room query error:", err?.response?.data || err.message || err);
    return null;
  }
}

// GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function normalizeNumber(value) {
  if (typeof value !== "string") return value;
  return Number(value.replace(/,/g, "").trim());
}

function applyFeeBound(filter, summary, operator, value) {
  if (Number.isNaN(value)) return;
  filter.monthlyFee = filter.monthlyFee || {};
  filter.monthlyFee[operator] = value;
  summary.push(`monthlyFee ${operator === "$lte" ? "<=" : ">="} ${value}`);
}

function buildSqlEquivalent(filter, sort, limit) {
  const clauses = [];

  if (filter.roomNumber !== undefined) clauses.push(`room_number = ${filter.roomNumber}`);
  if (filter.seaterType !== undefined) clauses.push(`seater_type = ${filter.seaterType}`);
  if (filter.status) clauses.push(`status = '${filter.status}'`);
  if (filter.monthlyFee) {
    const fee = filter.monthlyFee;
    if (fee.$gte !== undefined && fee.$lte !== undefined) {
      clauses.push(`monthly_fee BETWEEN ${fee.$gte} AND ${fee.$lte}`);
    } else if (fee.$gte !== undefined) {
      clauses.push(`monthly_fee >= ${fee.$gte}`);
    } else if (fee.$lte !== undefined) {
      clauses.push(`monthly_fee <= ${fee.$lte}`);
    }
  }

  let sql = "SELECT * FROM rooms";
  if (clauses.length) sql += ` WHERE ${clauses.join(" AND ")}`;
  if (sort?.monthlyFee === 1) sql += " ORDER BY monthly_fee ASC";
  if (sort?.monthlyFee === -1) sql += " ORDER BY monthly_fee DESC";
  if (sort?.roomNumber === 1) sql += " ORDER BY room_number ASC";
  if (limit) sql += ` LIMIT ${limit}`;
  return sql;
}

function parseRoomQuery(text) {
  const query = String(text || "").toLowerCase().replace(/[–—]/g, "-");
  const filter = {};
  const summary = [];
  const terms = {};
  let sort = null;
  let limit = null;
  let countMode = false;
  let wantBestMatch = false;

  const roomNumberMatch = query.match(/(?:room|room no\.?|room number|#)\s*#?\s*(\d+)/);
  if (roomNumberMatch) {
    const roomNumber = normalizeNumber(roomNumberMatch[1]);
    if (!Number.isNaN(roomNumber)) {
      filter.roomNumber = roomNumber;
      summary.push(`roomNumber = ${roomNumber}`);
    }
  }

  const wordSeatMap = { two: 2, double: 2, three: 3, triple: 3, four: 4, quad: 4 };
  const wordSeatMatch = query.match(/\b(two|double|three|triple|four|quad)\s*[- ]?(?:seater|seat|sharing|bed)?\b/);
  const seaterMatch = query.match(/(\d+)\s*[-]?\s*(?:seater|seat|sharing|bed)/);
  const seater = seaterMatch ? normalizeNumber(seaterMatch[1]) : wordSeatMap[wordSeatMatch?.[1]];
  if ([2, 3, 4].includes(seater)) {
    filter.seaterType = seater;
    summary.push(`seaterType = ${seater}`);
  }

  const priceRangeMatch = query.match(/(?:between|from)\s*(?:rs\.?|npr)?\s*([\d,]+)\s*(?:-|to|and)\s*(?:rs\.?|npr)?\s*([\d,]+)/);
  const priceDashRangeMatch = query.match(/(?:rs\.?|npr)?\s*([\d,]+)\s*(?:-|to)\s*(?:rs\.?|npr)?\s*([\d,]+)/);
  const rangeMatch = priceRangeMatch || priceDashRangeMatch;
  if (rangeMatch) {
    const min = normalizeNumber(rangeMatch[1]);
    const max = normalizeNumber(rangeMatch[2]);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      filter.monthlyFee = { $gte: Math.min(min, max), $lte: Math.max(min, max) };
      terms.targetBudget = Math.round((min + max) / 2);
      summary.push(`monthlyFee BETWEEN ${filter.monthlyFee.$gte} AND ${filter.monthlyFee.$lte}`);
    }
  }

  const lteMatch = query.match(/(?:under|below|less than|up to|at most|maximum|max|budget|<=?)\s*(?:rs\.?|npr)?\s*([\d,]+)/);
  const gteMatch = query.match(/(?:above|more than|greater than|minimum|min|>=?)\s*(?:rs\.?|npr)?\s*([\d,]+)/);
  const exactPriceMatch = query.match(/(?:for|cost|price|rent|around|near|about)\s*(?:rs\.?|npr)?\s*([\d,]+)/);
  if (!filter.monthlyFee && lteMatch) applyFeeBound(filter, summary, "$lte", normalizeNumber(lteMatch[1]));
  if (!filter.monthlyFee && gteMatch) applyFeeBound(filter, summary, "$gte", normalizeNumber(gteMatch[1]));
  if (!filter.monthlyFee && exactPriceMatch) {
    const value = normalizeNumber(exactPriceMatch[1]);
    if (!Number.isNaN(value)) {
      const tolerance = Math.max(Math.round(value * 0.15), 1000);
      filter.monthlyFee = { $gte: Math.max(value - tolerance, 0), $lte: value + tolerance };
      terms.targetBudget = value;
      summary.push(`monthlyFee near ${value}`);
    }
  }

  if (/available|free|vacant|open|empty|seat left|space/.test(query)) {
    filter.status = "Available";
    summary.push("status = Available");
  } else if (/full|occupied/.test(query)) {
    filter.status = "Full";
    summary.push("status = Full");
  } else if (/(?:room|rooms|seater|seat|sharing|bed)/.test(query)) {
    filter.status = "Available";
    summary.push("status = Available");
  }

  if (/free seat|most space|least crowded|less crowded|more seats/.test(query)) {
    terms.preferMoreFreeSeats = true;
    wantBestMatch = true;
  }

  if (/cheapest|lowest|affordable|budget|best.*price/.test(query)) {
    sort = { monthlyFee: 1 };
    limit = 1;
    wantBestMatch = true;
  }
  if (/expensive|premium|highest/.test(query)) {
    sort = { monthlyFee: -1 };
    terms.preferExpensive = true;
    limit = limit || 1;
    wantBestMatch = true;
  }
  if (/suggest|recommend|best room|best match|i want|looking for|need.*room/.test(query)) {
    sort = sort || { monthlyFee: 1 };
    limit = limit || 5;
    wantBestMatch = true;
  }
  if (/how many|count|number of/.test(query)) countMode = true;

  const limitMatch = query.match(/(?:top|show|list|give me)\s*(\d+)/);
  if (limitMatch) limit = Math.min(Math.max(normalizeNumber(limitMatch[1]), 1), 20);

  return {
    filter,
    sort,
    limit,
    countMode,
    wantBestMatch,
    terms,
    summary: summary.length ? summary.join(" AND ") : "all rooms",
  };
}

async function buildAlternativeSuggestion(baseFilter) {
  const relaxed = { ...baseFilter, status: "Available" };
  delete relaxed.roomNumber;
  delete relaxed.monthlyFee;

  const candidates = await Room.find(relaxed).sort({ monthlyFee: 1 }).limit(10);
  if (candidates.length) return candidates[0];

  const fallback = await Room.find({ status: "Available" }).sort({ monthlyFee: 1 }).limit(1);
  return fallback[0] || null;
}

function rankRooms(rooms, parsed) {
  const terms = parsed.terms || {};
  return [...rooms].sort((a, b) => {
    const availableScore = Number(b.status === "Available") - Number(a.status === "Available");
    if (availableScore) return availableScore;

    if (terms.preferMoreFreeSeats) {
      const freeDiff = getFreeSeats(b) - getFreeSeats(a);
      if (freeDiff) return freeDiff;
    }

    if (terms.targetBudget) {
      const aDistance = Math.abs((a.monthlyFee || 0) - terms.targetBudget);
      const bDistance = Math.abs((b.monthlyFee || 0) - terms.targetBudget);
      if (aDistance !== bDistance) return aDistance - bDistance;
    }

    if (terms.preferExpensive) return (b.monthlyFee || 0) - (a.monthlyFee || 0);
    return (a.monthlyFee || 0) - (b.monthlyFee || 0);
  });
}

// POST /api/rooms/query
exports.queryRooms = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Please provide a natural language query." });
    }

    const parsed = parseRoomQuery(query);
    const mongoQuery = Room.find(parsed.filter);
    if (parsed.sort) mongoQuery.sort(parsed.sort);
    if (parsed.limit && !parsed.terms?.targetBudget && !parsed.terms?.preferMoreFreeSeats) {
      mongoQuery.limit(parsed.limit);
    }

    const rawRooms = await mongoQuery.exec();
    const rankedRooms = rankRooms(rawRooms, parsed);
    const rooms = parsed.limit ? rankedRooms.slice(0, parsed.limit) : rankedRooms;
    const count = await Room.countDocuments(parsed.filter);
    const sqlEquivalent = buildSqlEquivalent(parsed.filter, parsed.sort, parsed.limit);

    const response = {
      query,
      filter: parsed.filter,
      sqlEquivalent,
      summary: parsed.summary,
      count,
      rooms,
      bestRoom: rooms[0] || null,
    };

    const aiMessage = await generateAssistantMessage(query, parsed, rooms, sqlEquivalent);
    if (aiMessage) response.aiMessage = aiMessage;

    if (rooms.length === 0) {
      const alternative = await buildAlternativeSuggestion(parsed.filter);
      if (alternative) {
        response.message = "No exact matches found. Here is the closest available alternative.";
        response.suggestedRoom = alternative;
      } else {
        response.message = "No rooms match that request and no available alternatives are currently open.";
      }
    } else if (parsed.countMode) {
      response.message = `Found ${count} matching room${count === 1 ? "" : "s"}.`;
    } else if (parsed.wantBestMatch) {
      response.message = "Showing the strongest room matches based on your request.";
    } else {
      response.message = `Found ${rooms.length} room${rooms.length === 1 ? "" : "s"} matching your query.`;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, seaterType, monthlyFee } = req.body;

    if (!roomNumber || !seaterType || !monthlyFee) {
      return res.status(400).json({ message: "Room number, seater type and monthly fee are required" });
    }

    const numRoomNumber = Number(roomNumber);
    if (isNaN(numRoomNumber) || numRoomNumber < 1) {
      return res.status(400).json({ message: "Room number must be a positive number" });
    }

    const numMonthlyFee = Number(monthlyFee);
    if (isNaN(numMonthlyFee) || numMonthlyFee < 0) {
      return res.status(400).json({ message: "Monthly fee must be a non-negative number" });
    }

    const exists = await Room.findOne({ roomNumber: numRoomNumber });
    if (exists) return res.status(400).json({ message: "Room number already exists" });

    const room = await Room.create({
      roomNumber: numRoomNumber,
      seaterType: Number(seaterType),
      totalSeats: Number(seaterType),
      monthlyFee: numMonthlyFee,
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const { monthlyFee } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (monthlyFee !== undefined) room.monthlyFee = Number(monthlyFee);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.occupiedSeats > 0) {
      return res.status(400).json({ message: "Cannot delete a room with occupied seats" });
    }
    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
