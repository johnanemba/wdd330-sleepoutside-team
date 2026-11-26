
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.cart = [];
    this.itemTotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.orderTotal = 0;
    this.services = new ExternalServices();
  }

  init() {
    this.cart = getLocalStorage(this.key) || [];

    this.calculateItemTotal();
    this.calculateOrderTotal();

    const zipInput = document.querySelector("#zip");
    const checkoutForm = document.querySelector("#checkout-form");

    if (zipInput) {
      zipInput.addEventListener("input", () => {
        this.calculateOrderTotal();
      });
    }

    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Use the browser's built-in form validation.
        if (!checkoutForm.checkValidity()) {
          checkoutForm.reportValidity();
          return;
        }

        this.checkout(checkoutForm);
      });
    }
  }

  calculateItemTotal() {
    this.itemTotal = this.cart.reduce((total, item) => {
      return total + Number(item.FinalPrice || 0);
    }, 0);
  }

  calculateOrderTotal() {
    const itemCount = this.cart.length;

    this.tax = this.itemTotal * 0.06;
    this.shipping = itemCount > 0 ? 10 + (itemCount - 1) * 2 : 0;

    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderSummary();
  }

  displayOrderSummary() {
    const output = document.querySelector(this.outputSelector);

    if (!output) {
      console.error("Order summary element was not found.");
      return;
    }

    output.querySelector("#item-count").textContent = this.cart.length;
    output.querySelector("#subtotal").textContent =
      this.itemTotal.toFixed(2);
    output.querySelector("#tax").textContent = this.tax.toFixed(2);
    output.querySelector("#shipping").textContent =
      this.shipping.toFixed(2);
    output.querySelector("#order-total").textContent =
      this.orderTotal.toFixed(2);
  }

  packageItems(items) {
    return items.map((item) => ({
      id: item.Id,
      name: item.Name,
      price: Number(item.FinalPrice),
      quantity: 1,
    }));
  }

  async checkout(form) {
    const message = document.querySelector("#checkout-message");

    if (this.cart.length === 0) {
      message.textContent = "Your cart is empty.";
      return;
    }

    this.calculateOrderTotal();

    const formData = new FormData(form);
    const customer = Object.fromEntries(formData.entries());

    const order = {
      fname: customer.fname,
      lname: customer.lname,
      street: customer.street,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      cardNumber: customer.cardNumber,
      expiration: customer.expiration,
      code: customer.code,
      orderDate: new Date().toISOString(),
      orderTotal: this.orderTotal,
      shipping: this.shipping,
      tax: this.tax,
      items: this.packageItems(this.cart),
    };

    try {
      if (message) {
        message.textContent = "Processing your order...";
      }

      const response = await this.services.checkout(order);

      console.log("Checkout response:", response);

      // Clear the cart only after a successful checkout.
      setLocalStorage(this.key, []);

      this.cart = [];
      this.calculateItemTotal();
      this.tax = 0;
      this.shipping = 0;
      this.orderTotal = 0;

      this.displayOrderSummary();
      form.reset();

      // Send the customer to the success page.
      window.location.href = "../success.html";

      return response;
    } catch (error) {
      console.error("Checkout failed:", error);

      if (message) {
        if (error.name === "servicesError") {
          message.textContent =
            error.message?.message ||
            error.message ||
            "Your order could not be placed.";
        } else {
          message.textContent =
            "Something went wrong. Please try again.";
        }
      }
    }
  }
}

const checkout = new CheckoutProcess("so-cart", "#order-summary");
checkout.init();
