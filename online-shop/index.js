const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const app = express();
const db = new sqlite3.Database("./data.db");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "insecure-secret",
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// HOME
app.get('/', (req, res) => {
  db.all("SELECT * FROM products", (err, products) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    res.render('home', { products });
  });
});

// REGISTER
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.run(
    `INSERT INTO users(username,password,role)
     VALUES('${username}','${password}','user')`
  );
  res.redirect("/login");
});

// LOGIN (SQLi intentionally present)

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

//   Уязвимый ❌
//    const sql = `
//      SELECT * FROM users
//      WHERE username='${username}' AND password='${password}'
//    `;
      
//   Защищенный ✅
    const sql = `
      SELECT * FROM users
      WHERE username = ? AND password = ?
    `;

  db.get(sql, (err, user) => {
    if (user) {
      req.session.user = user;
      res.redirect("/profile");
    } else {
      res.render("login", { error: "Invalid username or password" });
    }
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/profile");
  });
});

// PROFILE (smart page)
app.get("/profile", (req, res) => {
  res.render("profile", { user: req.session.user || null });
});

app.post(
  "/profile/avatar",
  upload.single("avatarFile"),
  (req, res) => {

    if (!req.session.user) {
      return res.redirect("/login");
    }

    let avatarUrl = req.body.avatar; // URL

    if (req.file) {
      avatarUrl = "/uploads/" + req.file.filename;
    }

    db.run(
      "UPDATE users SET avatar = ? WHERE id = ?",
      [avatarUrl, req.session.user.id],
      () => {
        req.session.user.avatar = avatarUrl;
        res.redirect("/profile");
      }
    );
  }
);

app.get("/products", (req, res) => {
  const q = req.query.q || "";
  const sql = `SELECT * FROM products WHERE name LIKE '%${q}%'`;

  db.all(sql, (err, products) => {
    res.render("products", { products, q });
  });
});

// PRODUCT
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
  res.render("checkout");
});

app.post("/checkout", (req, res) => {
  req.session.cart = [];
  res.send("Order placed successfully (INSECURE)");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server started on LAN");
});

app.post("/feedback", (req, res) => {
  const { name, text } = req.body;

  console.log("Feedback received:", name, text);

  res.json({
    name,
    text
  });
});

db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    message TEXT
  )
`);
