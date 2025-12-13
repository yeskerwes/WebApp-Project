const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./data.db");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "insecure-secret",
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// HOME
app.get("/", (req, res) => {
  res.render("home");
});

// LOGIN / REGISTER
app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username='${username}' AND password='${password}'`, // ❌ SQLi
    (err, user) => {
      if (user) {
        req.session.user = user;
        res.redirect("/");
      } else res.send("Login failed");
    }
  );
});

app.get("/register", (req, res) => res.render("register"));
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.run(
    `INSERT INTO users(username,password) VALUES('${username}','${password}')`
  );
  res.redirect("/login");
});

// PRODUCTS
app.get("/products", (req, res) => {
  const q = req.query.q || "";
  const sql = `SELECT * FROM products WHERE name LIKE '%${q}%'`;
  db.all(sql, (err, products) => {
    res.render("products", { products, q });
  });
});

// PRODUCT (XSS)
app.get("/product/:id", (req, res) => {
  db.get(
    `SELECT * FROM products WHERE id=${req.params.id}`,
    (err, product) => {
      res.render("product", { product });
    }
  );
});

// CART
app.get("/add-to-cart/:id", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(req.params.id);
  res.redirect("/cart");
});

app.get("/cart", (req, res) => {
  const ids = req.session.cart || [];
  if (ids.length === 0) return res.render("cart", { items: [] });

  const sql = `SELECT * FROM products WHERE id IN (${ids.join(",")})`;
  db.all(sql, (err, items) => {
    res.render("cart", { items });
  });
});

// CHECKOUT 
app.get("/checkout", (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.send("Your cart is empty");
  }
  res.render("checkout");
});

app.post("/checkout", (req, res) => {
    req.session.cart = [];
  res.send("Order placed (insecure)");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server started on LAN");
});
