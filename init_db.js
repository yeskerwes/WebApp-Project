const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS products");

  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      image TEXT
    )
  `);

  db.run(`INSERT INTO users(username,password) VALUES('admin','admin')`);

  db.run(`
    INSERT INTO products (name, description, price, image) VALUES
    (
      'Laptop',
      '<b>Powerful laptop</b> for work and study',
      1200,
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
    ),
    (
      'Smartphone',
      '<script>alert("XSS")</script> Modern phone',
      800,
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
    ),
    (
      'Headphones',
      'Wireless noise cancelling headphones',
      150,
      'https://images.unsplash.com/photo-1518444028785-8fefb6a8d6d4'
    )
  `);

  console.log("Database initialized");
});
