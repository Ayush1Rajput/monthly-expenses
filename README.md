# 💰 PennyWise — Mobile Daily & Monthly Expense Tracker

A modern, mobile-first Progressive Web App (PWA) designed to track your daily and monthly expenses in **₹ INR**, actively detect and flag **unnecessary / extra expenses**, and give you a **dynamic, visual 12-month Year in Review** right on your Android mobile.

---

## 🚀 Quick Start (Just 1-Click!)

Because you don't need any complex technical knowledge, a ready-to-run script is provided:

1. Go to your folder: `c:\Local Drive D\Monthly_Expenses`
2. **Double-click** on **`run-app.bat`**
3. It will automatically:
   - Start the backend server on port `5000`
   - Start the mobile app on port `5173`
   - Open your browser to `http://localhost:5173`

---

## 📱 How to Carry & Use on Your Android Mobile (No App Store Needed!)

1. Connect your Android phone to the **same Wi-Fi network** as your computer.
2. Open **Google Chrome** on your Android phone.
3. Type this address in Chrome's address bar:
   ```
   http://192.168.1.65:5173
   ```
4. Tap the **3 dots (menu)** in the top-right corner of Chrome.
5. Tap **"Install App"** (or **"Add to Home Screen"**).
6. ✨ The **PennyWise** app icon will appear on your phone's home screen. Tap it anytime to open it in **full-screen mode** just like a native app from Google Play Store!

---

## 🗄️ Where to Paste Your MongoDB Atlas Credentials

You can use the app immediately right now without any credentials (it will safely store your data on your phone/browser).

When you are ready to connect your cloud **MongoDB Atlas**:

1. Open this file in Notepad:
   `c:\Local Drive D\Monthly_Expenses\backend\.env`
2. You will see:
   ```env
   PORT=5000
   MONGODB_URI=
   ```
3. Paste your MongoDB Atlas connection string right after `MONGODB_URI=`. For example:
   ```env
   MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster0.abcde.mongodb.net/expenses?retryWrites=true&w=majority
   ```
   *(Make sure to replace `<password>` with your real MongoDB Atlas database user password!)*
4. Save the file (`Ctrl + S`).
5. In the app, you will see the pill at the top turn into **🟢 Atlas (Connected & Synced)**!

---

## ✨ Key Features & How to Use

### 1. ➕ 3-Second Quick Add Expense
- Tap the big green **`+`** button in the bottom center.
- Type the amount in **₹**.
- Write what you bought (e.g., *Swiggy dinner, Petrol, Clothes, Groceries*).
- Pick a category (*Food, Shopping, Bills, Fuel, Health, etc.*).

### 2. 🚨 Extra / Unnecessary Expense Detector
- In the Add modal, you will find a dedicated toggle: **"Extra / Unnecessary Expense?"**.
- When you turn it ON, it glows rose-red and lets you pick why (e.g. *Impulse Buy, Late Night Craving, Could Have Avoided, Flash Sale, Unused Subscription*).
- This trains your mindfulness and automatically categorizes your money into **Essential Needs** vs **Extra Wants**.

### 3. 🚫 Waste Watcher Tab
- Tap the **Waste Watch** icon on the bottom navigation bar.
- See your **total wasted money** this month and what percentage of your total income was burned on avoidable things.
- **Wealth Potential Calculator**: Tells you how much wealth you would accumulate in **1 year** and **3 years** if you invest that extra money into an index fund or SIP instead!
- Gives you **smart saving tips** tailored to where your leaks are.

### 4. 🎆 Dynamic Whole-Year Visual Review
- Tap **Yearly Trend** on the bottom navigation bar.
- **12-Month Spending Flow Chart**: Dynamic interactive area chart showing how your Essential vs Unnecessary spending evolved from January to December.
- **Interactive Month Bars**: Tap on any month bar to instantly zoom into that month.
- **Full Year Category Donut**: See which areas consumed the biggest chunk of your money across 365 days.
- **Year in Review (Wrapped)**: Spotify-style celebration cards displaying:
  - Total Money Spent in the year
  - Total Unnecessary Spend & Waste %
  - Peak Spending Month vs Most Frugal Month
  - #1 Category of the Year
  - Confetti button to celebrate hitting your savings goals!

### 5. 📋 History & 1-Click Excel/CSV Export
- Search any past expense by shop or item name.
- Filter to view **"Extra/Wants Only"** with one tap.
- Tap **"Export CSV"** to download an Excel-friendly file for your records.

### 6. 🪄 1-Click Demo Data Button
- Want to see what 12 months of charts and visual analytics look like immediately?
- Tap the **"Demo"** button in the top header or in Settings. It will instantly generate a full year of realistic expenses across all 12 months so you can experience the dynamic charts right away!
