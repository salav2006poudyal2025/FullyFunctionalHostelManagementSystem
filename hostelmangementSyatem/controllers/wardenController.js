const Warden = require("../models/Warden");

// ================= ADD WARDEN =================
exports.addWarden = async (req, res) => {
  try {
    const { email } = req.body;

    // ❌ check duplicate email
    const existing = await Warden.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "A warden with this email already exists."
      });
    }

    const warden = new Warden(req.body);
    await warden.save();

    res.json(warden);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= VIEW ALL =================
exports.getWardens = async (req, res) => {
  const wardens = await Warden.find();
  res.json(wardens);
};

// ================= UPDATE =================
exports.updateWarden = async (req, res) => {
  const updated = await Warden.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
};

// ================= DELETE =================
exports.deleteWarden = async (req, res) => {
  await Warden.findByIdAndDelete(req.params.id);

  res.json({ message: "Warden deleted successfully" });
};