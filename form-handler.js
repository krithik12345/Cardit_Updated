document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get the form values
        const email = document.getElementById("email").value;
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;

        // Log the form data
        console.log("Form Data:", { email, username, password });

        // Prepare the data to be sent to the backend
        const formData = {
            email: email,
            username: username,
            password: password
        };

        try {
            console.log("Sending data to backend...");

            // Send the data to the backend via POST request
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log("Response received from backend");

            // Handle the response from the backend
            const result = await response.json();
            console.log("Backend Response:", result);

            if (result.success) {
                console.log("Data successfully sent to MongoDB");
                alert("Data successfully sent to MongoDB");
            } else {
                console.log("Failed to send data to MongoDB:", result.error);
                alert("Failed to send data to MongoDB: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while sending data to MongoDB");
        }
    });
});
