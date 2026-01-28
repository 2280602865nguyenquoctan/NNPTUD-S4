// Ghi log ra cả DevTools console + màn hình #console-screen
(function () {
  const screen = document.getElementById("console-screen");

  function formatArg(arg) {
    if (typeof arg === "string") return arg;
    try {
      return JSON.stringify(arg, null, 2);
    } catch (e) {
      return String(arg);
    }
  }

  const originalLog = console.log;
  console.log = function (...args) {
    originalLog.apply(console, args);

    if (!screen) return;
    const text = args.map(formatArg).join(" ");

    // Giữ format xuống dòng đẹp cho object
    const pre = document.createElement("pre");
    pre.style.margin = "0 0 12px 0";
    pre.textContent = text;

    // Nếu còn dòng “Đang chờ…” thì xóa đi
    if (screen.dataset.cleared !== "true") {
      screen.textContent = "";
      screen.dataset.cleared = "true";
    }

    screen.appendChild(pre);
  };
})();

// Câu 1
function Product(id, name, price, quantity, category, isAvailable) {
  this.id = id;
  this.name = name;
  this.price = price;
  this.quantity = quantity;
  this.category = category;
  this.isAvailable = isAvailable;
}

// Câu 2
const products = [
  new Product(1, "iPhone 17", 35000000, 10, "Phone", true),
  new Product(2, "Samsung S23", 28000000, 5, "Phone", true),
  new Product(3, "MacBook Pro", 52000000, 3, "Laptop", true),
  new Product(4, "AirPods Pro", 6000000, 0, "Accessories", true),
  new Product(5, "Chuột Logitech", 1200000, 15, "Accessories", true),
  new Product(6, "Bàn phím cơ", 2500000, 7, "Accessories", false),
];

console.log("Products:", products);

// Câu 3
const nameAndPrice = products.map((p) => ({
  name: p.name,
  price: p.price,
}));
console.log("Câu 3:", nameAndPrice);

// Câu 4
const inStockProducts = products.filter((p) => p.quantity > 0);
console.log("Câu 4:", inStockProducts);

// Câu 5
const hasExpensiveProduct = products.some((p) => p.price > 30000000);
console.log("Câu 5:", hasExpensiveProduct);

// Câu 6
const allAccessoriesAvailable = products
  .filter((p) => p.category === "Accessories")
  .every((p) => p.isAvailable === true);
console.log("Câu 6:", allAccessoriesAvailable);

// Câu 7
const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
console.log("Câu 7:", totalValue);

// Câu 8 (SỬA LỖI: p.categoryn -> p.category)
for (const p of products) {
  const status = p.isAvailable ? "Đang bán" : "Ngừng bán";
  console.log(`Câu 8: ${p.name} - ${p.category} - ${status}`);
}

// Câu 9
console.log("Câu 9: Thuộc tính và giá trị của products[0]");
for (const key in products[0]) {
  console.log(`${key}: ${products[0][key]}`);
}

// Câu 10
const sellingAndInStock = products
  .filter((p) => p.isAvailable === true && p.quantity > 0)
  .map((p) => p.name);
console.log("Câu 10:", sellingAndInStock);
