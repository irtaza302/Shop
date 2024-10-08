// Global variables
let products = [];
let cart = [];
const salesTax = 0.08;
const discount = 0.05;
const bagCost = 0.5;

// Fetch products from JSON file
fetch("products.json")
  .then((response) => response.json())
  .then((data) => {
    products = data;
    populateProductList();
  })
  .catch((error) => console.error("Failed to fetch products:", error));

// Populate product list in the UI
function populateProductList() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.classList.add(
      "bg-gray-700",
      "rounded-lg",
      "overflow-hidden",
      "shadow-md",
      "hover:shadow-lg",
      "transition-shadow",
      "duration-300"
    );
    li.innerHTML = `
      <div class="p-4">
          <img src="${product.image}" alt="${
      product.name
    }" class="w-full h-32 object-cover mb-2 rounded">
          <h3 class="font-bold text-lg mb-1">${product.name}</h3>
          <p class="text-gray-300 mb-2">${product.price.toFixed(2)}</p>
          <p class="text-xs text-gray-400 cursor-pointer hover:text-blue-300" title="Click to copy">
            Code: <span class="product-code">${product.code}</span>
          </p>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full transition-colors duration-300">
            Add to Cart
          </button>
      </div>`;
    li.querySelector("button").onclick = () => addToCart(product);
    li.querySelector(".product-code").onclick = (e) =>
      copyProductCode(e, product.code);
    productList.appendChild(li);
  });
}

// Function to copy product code
function copyProductCode(event, code) {
  event.stopPropagation();
  navigator.clipboard
    .writeText(code)
    .then(() => {
      const span = event.target;
      const originalText = span.textContent;
      span.textContent = "Copied!";
      span.style.color = "#4CAF50";
      setTimeout(() => {
        span.textContent = originalText;
        span.style.color = "";
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy code: ", err);
    });
}

// Update cart in the UI
function updateCart() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = ""; // Clear current cart items

  if (cart.length === 0) {
    hideButtons();
  } else {
    showButtons();

    let htmlContent = "";
    cart.forEach((item) => {
      htmlContent += `
        <tr>
          <td class="px-4 py-2 name-cell">${item.name}</td>
          <td class="px-4 py-2 quantity-cell">
            <div class="flex items-center justify-center space-x-4">
              <button class="bg-red-500 text-white w-5 h-5 flex items-center justify-center font-bold rounded" onclick="changeQuantity('${
                item.code
              }', -1)">-</button>
              <span class="text-center w-8">${item.quantity}</span>
              <button class="bg-green-500 text-white w-5 h-5 flex items-center justify-center font-bold rounded" onclick="changeQuantity('${
                item.code
              }', 1)">+</button>
            </div>
          </td>
          <td class="px-4 py-2 price-cell text-right">${item.price.toFixed(
            2
          )}</td>
          <td class="px-4 py-2 total-cell text-right">${(
            item.price * item.quantity
          ).toFixed(2)}</td>
        </tr>`;
    });
    cartItems.innerHTML = htmlContent;
  }

  updateGrandTotal();
}

// Clear the cart
function clearCart() {
  cart = [];
  updateCart();
}
function showButtons() {
  document.getElementById("buyButton").classList.remove("hidden");
  document.getElementById("clearCartButton").classList.remove("hidden");
}

function hideButtons() {
  document.getElementById("buyButton").classList.add("hidden");
  document.getElementById("clearCartButton").classList.add("hidden");
}

// Show modal to confirm clearing the cart
function showClearCartModal() {
  if (cart.length > 0) {
    document.getElementById("clearCartModal").classList.remove("hidden");
    document.getElementById("clearCartModal").classList.add("flex");
  } else {
    console.log("Cart is already empty");
  }
}

// Define the function outside
function handleClearCartModal() {
  showClearCartModal();
}

// Use the named function for adding and removing
clearCartButton.removeEventListener("click", handleClearCartModal);
clearCartButton.addEventListener("click", handleClearCartModal);

document.getElementById("cancelClearCart").addEventListener("click", () => {
  document.getElementById("clearCartModal").classList.add("hidden");
  document.getElementById("clearCartModal").classList.remove("flex");
});

document.getElementById("confirmClearCart").addEventListener("click", () => {
  clearCart();
  document.getElementById("clearCartModal").classList.add("hidden");
  document.getElementById("clearCartModal").classList.remove("flex");
});

// Change quantity of an item in the cart
function changeQuantity(code, change) {
  const item = cart.find((item) => item.code === code);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.code !== code);
    }
    updateCart();
    // Highlight the updated item
    const updatedItemRow = document.querySelector(`#cartItems .item-${code}`);
    updatedItemRow.classList.add("bg-yellow-100");
    setTimeout(() => updatedItemRow.classList.remove("bg-yellow-100"), 500);
  }
}
// Initial check to hide buttons if cart is empty
document.addEventListener("DOMContentLoaded", function () {
  if (cart.length === 0) {
    hideButtons();
  }
});

// Update grand total in the UI
function updateGrandTotal() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = subtotal * discount;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = discountedSubtotal * salesTax;
  const bagsUsed = Math.ceil(
    cart.reduce((sum, item) => sum + item.quantity, 0) / 3
  );
  const bagAmount = bagsUsed * bagCost;
  const grandTotal = discountedSubtotal + taxAmount + bagAmount;

  document.getElementById("grandTotal").innerHTML = `
    <tr class="border-b border-gray-300">
      <td class="px-4 py-2">Subtotal:</td>
      <td class="px-4 py-2 text-right">${subtotal.toFixed(2)}</td>
    </tr>
    <tr class="border-b border-gray-300">
      <td class="px-4 py-2">Discount (5%):</td>
      <td class="px-4 py-2 text-right">-${discountAmount.toFixed(2)}</td>
    </tr>
    <tr class="border-b border-gray-300">
      <td class="px-4 py-2">Sales Tax (8%):</td>
      <td class="px-4 py-2 text-right">${taxAmount.toFixed(2)}</td>
    </tr>
    <tr class="border-b border-gray-300">
      <td class="px-4 py-2">Bags (${bagsUsed} @ $0.50 each):</td>
      <td class="px-4 py-2 text-right">${bagAmount.toFixed(2)}</td>
    </tr>
    <tr class="font-bold">
      <td class="px-4 py-2">Grand Total:</td>
      <td class="px-4 py-2 text-right">${grandTotal.toFixed(2)}</td>
    </tr>`;
}

// Add product to cart
function addToCart(product) {
  const existingItem = cart.find((item) => item.code === product.code);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  document.getElementById("searchInput").value = "";
  document.getElementById("suggestions").classList.add("hidden");
}

// Search for a product by code or name
function searchProduct(searchTerm) {
  const product = products.find(
    (p) =>
      p.code.toLowerCase() === searchTerm.toLowerCase() ||
      p.name.toLowerCase() === searchTerm.toLowerCase()
  );
  if (product) {
    addToCart(product);
    document.getElementById("searchInput").value = "";
    hideErrorMessage();
  } else {
    showErrorMessage("Invalid product code or name. Please try again.");
  }
}

// Show error message
function showErrorMessage(message) {
  const errorDiv = document.getElementById("errorMessage");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
    errorDiv.classList.add("bg-red-100", "text-red-800", "p-2", "rounded");
    setTimeout(() => errorDiv.classList.add("hidden"), 5000); // Auto-hide after 5 seconds
  }
}

// Hide error message
function hideErrorMessage() {
  const errorDiv = document.getElementById("errorMessage");
  if (errorDiv) {
    errorDiv.classList.add("hidden");
  }
}

// Show suggestions based on search term
function showSuggestions(searchTerm) {
  hideErrorMessage();
  const suggestionsContainer = document.getElementById("suggestions");
  suggestionsContainer.innerHTML = "";
  suggestionsContainer.classList.remove("hidden");

  const matchingProducts = products.filter(
    (product) =>
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  matchingProducts.forEach((product, index) => {
    const div = document.createElement("div");
    div.classList.add("p-2", "hover:bg-gray-100", "cursor-pointer");
    if (index === 0) div.classList.add("bg-gray-100");
    div.innerHTML = `
      <div class="font-bold">${product.name}</div>
      <div class="text-xs text-gray-600">Code: ${product.code}, Barcode: ${product.barcode}</div>`;
    div.onclick = () => selectSuggestion(product);
    suggestionsContainer.appendChild(div);
  });
}

// Select a suggestion and add it to the cart
function selectSuggestion(product) {
  addToCart(product);
}

// Navigate through suggestions using arrow keys
function navigateSuggestions(direction) {
  const suggestions = document.querySelectorAll("#suggestions > div");
  const activeIndex = Array.from(suggestions).findIndex((s) =>
    s.classList.contains("bg-gray-100")
  );
  suggestions[activeIndex]?.classList.remove("bg-gray-100");

  let newIndex;
  if (direction === "up") {
    newIndex = activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1;
  } else {
    newIndex = activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0;
  }

  suggestions[newIndex]?.classList.add("bg-gray-100");
  suggestions[newIndex]?.scrollIntoView({ block: "nearest" });
}

// Event listener for search input
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm.length > 0) {
    showSuggestions(searchTerm);
  } else {
    document.getElementById("suggestions").classList.add("hidden");
  }
});

// Event listener for keyboard navigation in search
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  const suggestionsContainer = document.getElementById("suggestions");
  if (suggestionsContainer.classList.contains("hidden")) return;

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      navigateSuggestions("up");
      break;
    case "ArrowDown":
      e.preventDefault();
      navigateSuggestions("down");
      break;
    case "Enter":
      e.preventDefault();
      const activeElement = document.querySelector("#suggestions .bg-gray-100");
      if (activeElement) {
        const activeProduct = products.find(
          (p) =>
            p.name ===
              activeElement.querySelector("div:first-child").textContent ||
            p.code ===
              activeElement
                .querySelector("div:last-child")
                .textContent.split(", ")[0]
                .split(": ")[1]
        );
        if (activeProduct) {
          selectSuggestion(activeProduct);
        }
      }
      break;
  }
});

// Event listener for search input (Enter key)
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const searchTerm = e.target.value.trim();
    if (searchTerm) {
      searchProduct(searchTerm);
    }
  }
});

// Event listener for clear cart button
document
  .getElementById("clearCartButton")
  .addEventListener("click", showClearCartModal);

// Event listener for buy button
document.getElementById("buyButton").addEventListener("click", () => {
  if (cart.length > 0) {
    document.getElementById("successModal").classList.remove("hidden");
    document.getElementById("successModal").classList.add("flex");
  }
});

// Event listener for OK button in success modal
document.getElementById("okButton").addEventListener("click", () => {
  document.getElementById("successModal").classList.add("hidden");
  document.getElementById("successModal").classList.remove("flex");
  showInvoice();
});

// Event listener for close invoice button
document.getElementById("closeInvoice").addEventListener("click", () => {
  document.getElementById("invoiceModal").classList.add("hidden");
  document.getElementById("invoiceModal").classList.remove("flex");
  cart = [];
  updateCart();
});

// Show invoice
function showInvoice() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * salesTax;
  const discountAmount = subtotal * discount;
  const bagsUsed = Math.ceil(
    cart.reduce((sum, item) => sum + item.quantity, 0) / 3
  );
  const bagAmount = bagsUsed * bagCost;
  const grandTotal = subtotal + taxAmount - discountAmount + bagAmount;

  const currentDate = new Date().toLocaleDateString();
  const invoiceNumber = "INV" + Math.floor(Math.random() * 100000);

  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoiceNumber}</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 p-8">
      <div class="bg-white border rounded-lg shadow-lg px-6 py-8 max-w-4xl mx-auto">
        <h1 class="font-bold text-3xl my-4 text-center text-black-700">Receipt</h1>
        <hr class="mb-6">
        <div class="flex justify-between mb-8">
          <h1 class="text-2xl font-bold">Invoice</h1>
          <div class="text-gray-700">
            <div>Date: ${currentDate}</div>
            <div>Invoice #: ${invoiceNumber}</div>
          </div>
        </div>
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4">Bill To:</h2>
          <div class="text-gray-700 mb-2">Customer</div>
          <div class="text-gray-700 mb-2">123 Main St.</div>
          <div class="text-gray-700 mb-2">Anytown, USA 12345</div>
          <div class="text-gray-700">customer@example.com</div>
        </div>
        <table class="w-full mb-8">
          <thead>
            <tr>
              <th class="text-left font-bold text-gray-700">Description</th>
              <th class="text-right font-bold text-gray-700">Quantity</th>
              <th class="text-right font-bold text-gray-700">Price</th>
              <th class="text-right font-bold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
              <tr>
                <td class="text-left text-gray-700">${item.name}</td>
                <td class="text-right text-gray-700">${item.quantity}</td>
                <td class="text-right text-gray-700">$${item.price.toFixed(
                  2
                )}</td>
                <td class="text-right text-gray-700">$${(
                  item.price * item.quantity
                ).toFixed(2)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right font-bold text-gray-700">Subtotal</td>
              <td class="text-right font-bold text-gray-700">$${subtotal.toFixed(
                2
              )}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right text-gray-700">Sales Tax (8%)</td>
              <td class="text-right text-gray-700">$${taxAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right text-gray-700">Discount (5%)</td>
              <td class="text-right text-gray-700">-$${discountAmount.toFixed(
                2
              )}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right text-gray-700">Bags (${bagsUsed} @ $0.50 each)</td>
              <td class="text-right text-gray-700">$${bagAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right font-bold text-gray-700">Total</td>
              <td class="text-right font-bold text-gray-700">$${grandTotal.toFixed(
                2
              )}</td>
            </tr>
          </tfoot>
        </table>
        <div class="text-gray-700 mb-2">Thank you for your purchase!</div>
        <div class="text-gray-700 text-sm">Please keep this invoice for your records.</div>
      </div>
    </body>
    </html>`;

  const blob = new Blob([invoiceHTML], { type: "text/html" });
  const invoiceURL = URL.createObjectURL(blob);

  const invoiceLink = document.getElementById("invoiceLink");
  invoiceLink.href = invoiceURL;
  invoiceLink.click();

  // Clean up the cart
  cart = [];
  updateCart();
}

// Sidebar logic
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  sidebar.addEventListener("mouseenter", () => {
    sidebar.classList.add("show-scrollbar");
  });
  sidebar.addEventListener("mouseleave", () => {
    sidebar.classList.remove("show-scrollbar");
  });

  const mainContent = document.getElementById("mainContent");
  const toggleSidebar = document.getElementById("toggleSidebar");

  toggleSidebar.addEventListener("click", function () {
    sidebar.classList.toggle("sidebar-expanded");
    sidebar.classList.toggle("-translate-x-full");
    adjustMainContent();
  });

  function adjustMainContent() {
    if (sidebar.classList.contains("sidebar-expanded")) {
      mainContent.style.marginLeft = "250px";
    } else {
      mainContent.style.marginLeft = "0";
    }
  }

  // Initial adjustment
  adjustMainContent();
});

div.setAttribute("role", "button"); // Make divs accessible
div.setAttribute("tabindex", "0"); // Make divs focusable
