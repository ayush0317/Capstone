const mongoose = require("mongoose");
const Table = require("./models/table");

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("✅ Connected to MongoDB");

    // ✅ Clear Existing Tables
    await Table.deleteMany();

    // ✅ Insert Sample Tables
    let tables = [
        { locationId: "1", x: 20, y: 40, isBooked: false }, // Table 1
        { locationId: "1", x: 50, y: 60, isBooked: true },  // Table 2 (Booked)
        { locationId: "1", x: 30, y: 70, isBooked: false }, // Table 3
        { locationId: "1", x: 60, y: 30, isBooked: true },  // Table 4 (Booked)
    ];

    await Table.insertMany(tables);
    console.log("✅ Tables seeded successfully!");
    process.exit();
}).catch(err => console.log("❌ DB Connection Error:", err));
