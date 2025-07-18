const express = require("express");
const router = express.Router();
const Listing = require("../models/listings"); 


router.get("/suggestions", async (req, res) => {
  const query = req.query.q?.trim();
  console.log("🔍 Received query:", query);
  if (!query) return res.json([]);

  try {
    const listings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } }
      ]
    })
    .limit(5)
    .select("title location");

    console.log("✅ Matching listings:", listings);

    const suggestions = listings.map(listing => ({
      text: `${listing.title} – ${listing.location}`
    }));

    res.json(suggestions);
  } catch (err) {
    console.error("❌ Error fetching suggestions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
