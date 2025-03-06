const mongoose = require("mongoose");
const MenuItem = require("./models/menuItem");

// ✅ Connect to `userDB` instead of `restaurantDB`
mongoose.connect("mongodb://localhost:27017/userDB")
    .then(() => console.log("✅ Connected to MongoDB (userDB)"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ Menu Data to Insert
const menuItems = [
    // ✅ Appetizers - Vegetarian
    { name: "Paneer Tikka", description: "Charcoal-grilled cottage cheese with saffron yogurt.", price: 599, category: "Appetizers", type: "Vegetarian", image: "paneer-tikka.png" },
    { name: "Bruschetta Classico", description: "Italian baguette with vine-ripened tomatoes & basil.", price: 549, category: "Appetizers", type: "Vegetarian", image: "bruschetta.png" },

    // ✅ Appetizers - Non-Vegetarian
    { name: "Charcoal Smoked Chicken Wings", description: "Slow-cooked in bourbon-infused BBQ glaze.", price: 799, category: "Appetizers", type: "Non-Vegetarian", image: "chicken-wings.png" },

    // ✅ Main Course - Vegetarian
    { name: "Dal Makhni", description: "Lentils cooked with onions, tomatoes & spices.", price: 1695, category: "Main Course", type: "Vegetarian", image: "dal-makhni.png" },
    { name: "Paneer Butter Masala", description: "Premium paneer cubes slow-cooked in a rich tomato cream sauce.", price: 1099, category: "Main Course", type: "Vegetarian", image: "paneer-butter-masala.png" },

    // ✅ Main Course - Non-Vegetarian
    { name: "Butter Chicken Supreme", description: "Creamy tomato sauce with smoked butter & fenugreek.", price: 1399, category: "Main Course", type: "Non-Vegetarian", image: "butter-chicken.png" },

    // ✅ Desserts
    { name: "Classic Tiramisu", description: "Espresso-soaked ladyfingers & mascarpone.", price: 899, category: "Desserts", type: "Vegetarian", image: "tiramisu.png" },

    // ✅ Beverages
    { name: "Classic Mint Mojito", description: "Hand-picked mint leaves, lime, and soda.", price: 599, category: "Beverages", type: "Vegetarian", image: "mint-mojito.png" }
];

// ✅ Remove old menu items before inserting new ones
async function seedDatabase() {
    try {
        await MenuItem.deleteMany({});
        console.log("✅ Old menu items removed from userDB.menuitems.");

        await MenuItem.insertMany(menuItems);
        console.log("✅ New menu items added to userDB.menuitems!");
    } catch (err) {
        console.error("❌ Error inserting menu items:", err);
    } finally {
        mongoose.connection.close();
        console.log("✅ Database connection closed.");
    }
}

// ✅ Run Seeding Function
seedDatabase();
