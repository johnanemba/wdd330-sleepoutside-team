
const form = document.querySelector("#register-form");
const message = document.querySelector("#message");
const button = document.querySelector("#register-button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const customer = {
    name: document.querySelector("#name").value.trim(),
    address: document.querySelector("#address").value.trim(),
    email: document.querySelector("#email").value.trim(),
    password: document.querySelector("#password").value
  };

  message.textContent = "Creating account...";
  button.disabled = true;

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
      throw new Error(
        result.message || "Account creation failed."
      );
    }

    message.textContent = "Account created successfully!";
    form.reset();

  } catch (error) {
    console.error("Registration error:", error);
    message.textContent = error.message;

  } finally {
    button.disabled = false;
  }
});
