const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    address: { type: String, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, trim: true },
    postcode: { type: String, trim: true },
    state: { type: String, default: "Queensland", trim: true },
    country: { type: String, default: "Australia", trim: true },
    company: { type: String, trim: true },
    abn: { type: String, trim: true },
    phone: { type: String, trim: true },
    fax: { type: String, trim: true },
    tags: [{ type: String, trim: true }], // for future: residential, commercial, etc.
  },
  {
    timestamps: true,
  },
);

CustomerSchema.index({ firstName: 1, lastName: 1, email: 1, mobile: 1 });

module.exports = mongoose.model("Customer", CustomerSchema);
