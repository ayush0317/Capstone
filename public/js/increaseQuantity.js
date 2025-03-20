async function increaseQuantity(itemId) {
    try {
        console.log(`➕ Increasing quantity for item: ${itemId}`);

        let response = await fetch("/cart/increase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId })
        });

        let result = await response.json();
        if (result.success) {
            loadCart(); // ✅ Ensure UI & Checkout update correctly
        } else {
            alert("Error updating quantity");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}
