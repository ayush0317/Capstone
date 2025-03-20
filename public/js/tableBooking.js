document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reservation-form");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(form);
            const jsonData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch("/reserve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(jsonData),
                });

                const data = await response.json();

                if (data.success) {
                    // ✅ Show "Yay!" message on the screen
                    alert("🎉 Yay! Your reservation is confirmed!");

                    // ✅ Redirect to the home screen after 3 seconds
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 3000);
                } else {
                    alert("❌ Error: " + data.message);
                }
            } catch (error) {
                alert("❌ Error processing reservation.");
            }
        });
    }
});
