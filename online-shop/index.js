const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const db = new sqlite3.Database("./data.db");

/* ==================================================
   SECURE UPLOAD CONFIGURATION
================================================== */
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      !allowedMime.includes(file.mimetype) ||
      !allowedExt.includes(ext)
    ) {
      
      return cb(new Error("INVALID_FILE_TYPE"));
    }

    cb(null, true);
  }
});


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "secure-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

/* ==================================================
   HOME
================================================== */

app.get("/", (req, res) => {
  db.all("SELECT * FROM products", (err, products) => {
    if (err) return res.sendStatus(500);
    res.render("home", { products });
  });
});

/* ==================================================
   REGISTER
================================================== */

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // ❌ SQL Injection
  // db.run(`INSERT INTO users VALUES('${username}','${password}','user')`);

  // ✅ Prepared Statement
  db.run(
    "INSERT INTO users(username,password,role) VALUES(?,?,?)",
    [username, password, "user"],
    () => res.redirect("/login")
  );
});

/* ==================================================
   LOGIN
================================================== */

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // ❌ SQL Injection
  // const sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

  // ✅ Safe
  const sql = `
    SELECT * FROM users
    WHERE username = ? AND password = ?
  `;

  db.get(sql, [username, password], (err, user) => {
    if (user) {
      req.session.user = user;
      res.redirect("/profile");
    } else {
      res.render("login", { error: "Invalid credentials" });
    }
  });
});

/* ==================================================
   LOGOUT
================================================== */

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

/* ==================================================
   PROFILE
================================================== */

app.get("/profile", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("profile", { user: req.session.user });
});

/* ==================================================
   AVATAR UPLOAD
================================================== */

app.post("/profile/avatar", (req, res) => {
  upload.single("avatarFile")(req, res, (err) => {

    if (!req.session.user) {
      return res.redirect("/login");
    }

    if (err && err.message === "INVALID_FILE_TYPE") {
      return res.render("profile", {
        user: req.session.user,
        error: "Invalid file type. Only images are allowed. (JPG, PNG, WEBP)."
      });
    }

    if (err) {
      return res.render("profile", {
        user: req.session.user,
        error: "File download error"
      });
    }

    if (!req.file) {
      return res.redirect("/profile");
    }

    const avatarName = req.file.filename;

    db.run(
      "UPDATE users SET avatar = ? WHERE id = ?",
      [avatarName, req.session.user.id],
      () => {
        req.session.user.avatar = avatarName;
        res.redirect("/profile");
      }
    );
  });
});


/* ==================================================
   SAFE AVATAR SERVE
================================================== */

app.get("/avatar/:name", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.name);

  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.sendStatus(403);
  }

  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }

  res.sendFile(filePath);
});

/* ==================================================
   PRODUCTS
================================================== */

app.get("/products", (req, res) => {
  const q = req.query.q || "";
  const sql = "SELECT * FROM products WHERE name LIKE ?";

  db.all(sql, [`%${q}%`], (err, products) => {
    res.render("products", { products, q });
  });
});

/* ==================================================
   PRODUCT
================================================== */

app.get("/product/:id", (req, res) => {
  db.get(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, product) => {
      res.render("product", { product });
    }
  );
});

/* ==================================================
   CART
================================================== */

app.get("/add-to-cart/:id", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(req.params.id);
  res.redirect("/cart");
});

app.get("/cart", (req, res) => {
  const ids = req.session.cart || [];
  if (ids.length === 0) return res.render("cart", { items: [] });

  const placeholders = ids.map(() => "?").join(",");
  const sql = `SELECT * FROM products WHERE id IN (${placeholders})`;

  db.all(sql, ids, (err, items) => {
    res.render("cart", { items });
  });
});

/* ==================================================
   CHECKOUT
================================================== */

app.get("/checkout", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("checkout");
});

app.post("/checkout", (req, res) => {
  req.session.cart = [];
  res.send("Order placed successfully");
});

/* ==================================================
   FEEDBACK
================================================== */

app.post("/feedback", (req, res) => {
  const { name, text } = req.body;
  db.run(
    "INSERT INTO feedback(name, message) VALUES(?, ?)",
    [name, text]
  );

  res.json({ status: "ok" });
});

/* ==================================================
   DB INIT
================================================== */

db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    message TEXT
  )
`);

/* ==================================================
   START
================================================== */

app.listen(3000, "0.0.0.0", () => {
  console.log("Secure server started on port 3000");
});
