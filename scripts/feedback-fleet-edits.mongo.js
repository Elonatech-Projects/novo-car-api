// Fleet catalogue edits from the Novo website feedback (Batch 2).
// Run in mongosh against the production "Novo Database", or paste into
// MongoDB Compass's shell. REVIEW each step before running — names in the
// live DB may differ slightly from what's assumed here.
//
//   mongosh "<MONGO_URL>"
//   use <dbName>
//   load("feedback-fleet-edits.mongo.js")   // or paste blocks individually

// ── 0. Inspect current fleet first (recommended) ──────────────────────────────
db.cars.find({}, { name: 1, model: 1, subModel: 1, price: 1, isAvailable: 1 }).sort({ name: 1 });

// ── 1. Remove BYD Seal U (no longer part of the fleet) ────────────────────────
db.cars.deleteMany({ name: /BYD\s*Seal\s*U/i });

// ── 2. Remove the DUPLICATE High Roof bus ─────────────────────────────────────
// There are two "High Roof" listings. Keep "Toyota Hiace High Roof (2017)" and
// delete the older generic one. Inspect first:
db.cars.find({ name: /Hiace\s*High\s*Roof/i }, { name: 1, subModel: 1, price: 1 });
// Then delete the duplicate — adjust the filter to the exact duplicate's name/_id:
db.cars.deleteOne({ name: "Toyota Hiace High Roof" });           // by name, OR
// db.cars.deleteOne({ _id: ObjectId("PASTE_DUPLICATE_ID_HERE") }); // by _id (safest)

// ── 3. Update BYD Atto 3 -> 2025 model, price N180,000 ────────────────────────
db.cars.updateOne(
  { name: /BYD\s*Atto\s*3/i },
  {
    $set: {
      name: "BYD Atto 3 (2025)",
      model: "BYD",
      subModel: "2025",
      price: 180000,
    },
  }
);

// ── 4. Add the new Toyota Hiace Standard Bus ──────────────────────────────────
db.cars.insertOne({
  name: "Toyota Hiace Standard Bus",
  category: "Buses",
  model: "Hiace",
  subModel: "Standard",
  description:
    "Standard-roof Hiace bus ideal for everyday group and staff transportation.",
  features: [
    "Standard roof design",
    "10-14 seating capacity",
    "Front and rear air conditioning",
    "Sliding side door",
    "Basic audio system",
    "Strong suspension",
  ],
  images: ["https://res.cloudinary.com/dw1q14n6h/image/upload/v1779463248/_MG_0534_vzai1l.jpg"],
  price: 148800,
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ── 5. Verify ─────────────────────────────────────────────────────────────────
db.cars.find({}, { name: 1, model: 1, subModel: 1, price: 1 }).sort({ name: 1 });
