const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");

db.serialize(() => {

  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS products");

  // USERS
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      card_number TEXT,
      avatar TEXT
    )
  `);

  // PRODUCTS
  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      username TEXT,
      review TEXT
    )
  `);

  // USERS DATA
  db.run(`
    INSERT INTO users (username, password, role, card_number, avatar)
    VALUES
      (
        'user@gmail.com',
        'user123',
        'user',
        '4539 1488 0343 6467',
        NULL
      ),
      (
        'admin@gmail.com',
        'admin123',
        'admin',
        '4916 2178 9876 1234',
        NULL
      ),
        (
          'baxa',
          '020806',
          'baxa',
          '7777 7777 7777 7777',
          NULL
        )
  `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        message TEXT
      )
    `);


  // PRODUCTS
  db.run(`
    INSERT INTO products (name, description, price, image, username, review)
    VALUES
      (
        'iPad Pro',
        'Apple tablet for work and creativity',
        799,
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
        'Samrat',
        'Very powerful tablet'
      ),
      (
        'MacBook Pro',
        'Laptop for developers and designers',
        1999,
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        'Bakdaulet',
        'Perfect for coding'
      ),
      (
        'iPhone',
        'Modern smartphone',
        999,
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        'User',
        'Fast and smooth'
      ),
      (
        'Sony Headphones',
        'Wireless noise cancelling headphones',
        399,
        'https://images.unsplash.com/photo-1519677100203-a0e668c92439',
        'Kairat',
        'Great sound quality'
      ),
      (
        'Canon Camera',
        'Professional digital camera',
        2499,
        'https://images.unsplash.com/photo-1519183071298-a2962eadcdb2',
        'Samal',
        'Amazing photos'
      ),
      (
        '4K Monitor',
        'Large high-resolution monitor',
        649,
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
        'Water',
        'Very clear image'
      ),
      (
        'Mechanical Keyboard',
        'RGB mechanical keyboard',
        149,
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae',
        'Maksat',
        'Nice typing feel'
      ),
      (
        'Gaming Mouse',
        'High precision mouse',
        99,
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
        'Ayazhan',
        'Very accurate'
      ),
      (
        'Smart Watch',
        'Smartwatch with fitness tracking',
        429,
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        'Tolebi',
        'Useful every day'
      ),
      (
        'Android Tablet',
        'Tablet for media and browsing',
        699,
        'https://images.unsplash.com/photo-1587033411391-5d9e51cce126',
        'Assylbek',
        'Good value for money'
      )
  `);

  console.log("✅ Database initialized successfully");
});

db.close();
