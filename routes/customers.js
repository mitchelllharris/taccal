const express = require("express");
const Customer = require("../models/Customer");
const router = express.Router();

// POST /api/customers - Create a new customer
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    // Basic validation
    if (!data.firstName || !data.lastName) {
      return res
        .status(400)
        .json({ error: "First and last name are required." });
    }
    // Optionally: check for duplicate by email or mobile
    if (data.email) {
      const existing = await Customer.findOne({ email: data.email });
      if (existing) {
        return res
          .status(400)
          .json({ error: "A customer with this email already exists." });
      }
    }
    const customer = new Customer(data);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create customer", details: err.message });
  }
});

// GET /api/customers/search?q=... - Search customers by name, email, or phone
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json([]);
    const regex = new RegExp(q, "i");
    const customers = await Customer.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { mobile: regex },
        { company: regex },
      ],
    }).limit(10);
    res.json(customers);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to search customers", details: err.message });
  }
});

module.exports = router;
