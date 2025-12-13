# WebApp-Project
Online shop 
# Web Application Security – Vulnerable Online Shop

## 📌 Project Overview
This project is a **deliberately vulnerable web application** created for an academic **Web Application Security** course.

The application represents a simple **online shop** and intentionally contains common security vulnerabilities from the **OWASP Top 10**, which are later used for:
- vulnerability assessment
- attack simulation
- security remediation

⚠️ **Important:**  
This project is for **educational purposes only**.  
All testing must be performed in a controlled environment.

---

## 🧪 Implemented Vulnerabilities
The following vulnerabilities are intentionally present in the application:

- **SQL Injection (SQLi)**  
  - Product search functionality
- **Cross-Site Scripting (Stored XSS)**  
  - Product name and description rendering
- **Broken Authentication / Access Control**  
  - Weak login logic
  - Checkout available without authentication

These vulnerabilities are required for attack simulation and later mitigation.

---

## 🛠 Technologies Used
- **Node.js**
- **Express.js**
- **EJS (template engine)**
- **SQLite3**
- **Express-session**
- **HTML / CSS**

---

## 📁 Project Structure



---

## 🚀 How to Run the Project (For a New User)

### 1️⃣ Prerequisites
Make sure you have installed:
- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- **Git**

Check versions:
```bash
node -v
npm -v
git --version
