const form = document.querySelector("#register-form");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const customer = {
    name: document.querySelector("#name").value.trim(),
    address: document.querySelector("#address").value.trim(),
    email: document.querySelector("#email").value.trim()
  };

  message.textContent = "Registering...";

  try {
    const response = await fetch(
      "https://wdd330-backend.onrender.com/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registration failed.");
    }

    message.textContent = "Registration successful!";
    form.reset();
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
});