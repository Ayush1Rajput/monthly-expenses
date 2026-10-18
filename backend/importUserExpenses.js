import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Expense from './models/Expense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const rawExpenses = [
  // BLOCK 1: July 2026 (Month 7)
  { day: 1, month: 7, title: "Room Rent", amount: 7500, category: "Bills & Utilities", isUnnecessary: false },
  { day: 1, month: 7, title: "Security", amount: 1000, category: "Bills & Utilities", isUnnecessary: false },
  { day: 1, month: 7, title: "Soap, brush, colgate", amount: 100, category: "Personal Care", isUnnecessary: false },
  { day: 2, month: 7, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 3, month: 7, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 4, month: 7, title: "Sampoo", amount: 10, category: "Personal Care", isUnnecessary: false },
  { day: 5, month: 7, title: "Food (Monu Bhai)", amount: 210, category: "Food & Dining", isUnnecessary: false },
  { day: 6, month: 7, title: "Food + cold drink", amount: 70, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Cold drink craving" },
  { day: 7, month: 7, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 8, month: 7, title: "Food", amount: 140, category: "Food & Dining", isUnnecessary: false },
  { day: 9, month: 7, title: "Food", amount: 100, category: "Food & Dining", isUnnecessary: false },
  { day: 9, month: 7, title: "Press (Iron)", amount: 460, category: "Others", isUnnecessary: false },
  { day: 9, month: 7, title: "Umbrella", amount: 200, category: "Others", isUnnecessary: false },
  { day: 9, month: 7, title: "Kale Chana", amount: 100, category: "Groceries", isUnnecessary: false },
  { day: 10, month: 7, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 11, month: 7, title: "Clip, Soap", amount: 20, category: "Personal Care", isUnnecessary: false },
  { day: 11, month: 7, title: "Medicine", amount: 20, category: "Health & Medical", isUnnecessary: false },
  { day: 12, month: 7, title: "Photo copy", amount: 40, category: "Education", isUnnecessary: false },
  { day: 12, month: 7, title: "Pocket file", amount: 50, category: "Education", isUnnecessary: false },
  { day: 13, month: 7, title: "Travel to TCS", amount: 182, category: "Transport & Fuel", isUnnecessary: false },
  { day: 13, month: 7, title: "Food", amount: 70, category: "Food & Dining", isUnnecessary: false },
  { day: 14, month: 7, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 15, month: 7, title: "Food", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 16, month: 7, title: "Food + Biscuit", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 17, month: 7, title: "Food + Evening breakfast", amount: 90, category: "Food & Dining", isUnnecessary: false },
  { day: 18, month: 7, title: "Cold drink", amount: 40, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Cold drink" },
  { day: 19, month: 7, title: "Biscuit + soap", amount: 90, category: "Groceries", isUnnecessary: false },
  { day: 19, month: 7, title: "Navratan oil", amount: 44, category: "Personal Care", isUnnecessary: false },
  { day: 19, month: 7, title: "Chips", amount: 25, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Packaged chips snack" },
  { day: 20, month: 7, title: "Food", amount: 70, category: "Food & Dining", isUnnecessary: false },
  { day: 21, month: 7, title: "Food", amount: 70, category: "Food & Dining", isUnnecessary: false },
  { day: 22, month: 7, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 23, month: 7, title: "Food + Candy", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 24, month: 7, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 25, month: 7, title: "Socks", amount: 40, category: "Shopping & Clothing", isUnnecessary: false },
  { day: 25, month: 7, title: "Metro + auto", amount: 72, category: "Transport & Fuel", isUnnecessary: false },
  { day: 25, month: 7, title: "Surf", amount: 10, category: "Groceries", isUnnecessary: false },
  { day: 27, month: 7, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 27, month: 7, title: "Talcum powder + soap", amount: 110, category: "Personal Care", isUnnecessary: false },
  { day: 28, month: 7, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 29, month: 7, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 29, month: 7, title: "Samosa", amount: 50, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Fried snack craving" },
  { day: 30, month: 7, title: "Rapido", amount: 20, category: "Transport & Fuel", isUnnecessary: false },
  { day: 30, month: 7, title: "Samosa", amount: 30, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Fried snack craving" },
  { day: 31, month: 7, title: "Samosa", amount: 20, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Fried snack craving" },
  { day: 31, month: 7, title: "Juice / Food", amount: 70, category: "Food & Dining", isUnnecessary: false },

  // BLOCK 2: August 2026 (Month 8)
  { day: 1, month: 8, title: "Power cable", amount: 150, category: "Bills & Utilities", isUnnecessary: false },
  { day: 2, month: 8, title: "Room Rent", amount: 7500, category: "Bills & Utilities", isUnnecessary: false },
  { day: 2, month: 8, title: "Soap", amount: 20, category: "Personal Care", isUnnecessary: false },
  { day: 2, month: 8, title: "Recharge", amount: 300, category: "Bills & Utilities", isUnnecessary: false },
  { day: 2, month: 8, title: "Biscuit 🍪", amount: 56, category: "Groceries", isUnnecessary: false },
  { day: 3, month: 8, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 4, month: 8, title: "Food", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 5, month: 8, title: "Food", amount: 120, category: "Food & Dining", isUnnecessary: false },
  { day: 5, month: 8, title: "Recharge", amount: 350, category: "Bills & Utilities", isUnnecessary: false },
  { day: 6, month: 8, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 7, month: 8, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 8, month: 8, title: "Pen 🖊️", amount: 10, category: "Education", isUnnecessary: false },
  { day: 8, month: 8, title: "Sampoo", amount: 5, category: "Personal Care", isUnnecessary: false },
  { day: 8, month: 8, title: "Chaat", amount: 30, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Street food craving" },
  { day: 9, month: 8, title: "Jeans 👖", amount: 800, category: "Shopping & Clothing", isUnnecessary: true, unnecessaryReason: "Impulse clothing" },
  { day: 9, month: 8, title: "Box", amount: 40, category: "Others", isUnnecessary: false },
  { day: 9, month: 8, title: "Food", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 10, month: 8, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 11, month: 8, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 11, month: 8, title: "Grocery (Vishal Mega Mart)", amount: 419, category: "Groceries", isUnnecessary: false },
  { day: 12, month: 8, title: "Food", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 13, month: 8, title: "Food", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 14, month: 8, title: "Food", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 16, month: 8, title: "Cold Drink", amount: 40, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Cold drink" },
  { day: 17, month: 8, title: "Food", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 17, month: 8, title: "Auto Fare", amount: 20, category: "Transport & Fuel", isUnnecessary: false },
  { day: 17, month: 8, title: "Candid dusting powder", amount: 174, category: "Health & Medical", isUnnecessary: false },
  { day: 18, month: 8, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 18, month: 8, title: "Cold drink", amount: 50, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Cold drink" },
  { day: 19, month: 8, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 19, month: 8, title: "Food", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 20, month: 8, title: "Food", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 20, month: 8, title: "Food", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 21, month: 8, title: "Auto Fare", amount: 10, category: "Transport & Fuel", isUnnecessary: false },
  { day: 21, month: 8, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 21, month: 8, title: "Cold Drink", amount: 20, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Cold drink" },
  { day: 22, month: 8, title: "Soap 🧼", amount: 20, category: "Personal Care", isUnnecessary: false },
  { day: 22, month: 8, title: "Event & Travel", amount: 122, category: "Entertainment & OTT", isUnnecessary: false },
  { day: 22, month: 8, title: "Toothpaste", amount: 20, category: "Personal Care", isUnnecessary: false },
  { day: 24, month: 8, title: "Food", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 24, month: 8, title: "Perfume", amount: 228, category: "Personal Care", isUnnecessary: true, unnecessaryReason: "Fragrance / impulse" },
  { day: 25, month: 8, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 26, month: 8, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 26, month: 8, title: "Metro", amount: 31, category: "Transport & Fuel", isUnnecessary: false },
  { day: 26, month: 8, title: "Bus Travel", amount: 200, category: "Transport & Fuel", isUnnecessary: false },
  { day: 26, month: 8, title: "Auto Fare", amount: 100, category: "Transport & Fuel", isUnnecessary: false },
  { day: 27, month: 8, title: "Doctor fees", amount: 500, category: "Health & Medical", isUnnecessary: false },
  { day: 30, month: 8, title: "Bus 🚌", amount: 225, category: "Transport & Fuel", isUnnecessary: false },
  { day: 30, month: 8, title: "Metro card", amount: 150, category: "Transport & Fuel", isUnnecessary: false },
  { day: 31, month: 8, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 31, month: 8, title: "Dinner", amount: 60, category: "Food & Dining", isUnnecessary: false },

  // BLOCK 3: September 2026 (Month 9)
  { day: 1, month: 9, title: "Room Rent", amount: 1500, category: "Bills & Utilities", isUnnecessary: false },
  { day: 1, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 1, month: 9, title: "Recharge (Deepika)", amount: 300, category: "Bills & Utilities", isUnnecessary: false },
  { day: 2, month: 9, title: "Milk", amount: 27, category: "Groceries", isUnnecessary: false },
  { day: 2, month: 9, title: "Recharge (Papa)", amount: 400, category: "Bills & Utilities", isUnnecessary: false },
  { day: 2, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 2, month: 9, title: "Curd", amount: 20, category: "Groceries", isUnnecessary: false },
  { day: 3, month: 9, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 3, month: 9, title: "Down Payment", amount: 5120, category: "Bills & Utilities", isUnnecessary: false },
  { day: 4, month: 9, title: "Surf", amount: 15, category: "Groceries", isUnnecessary: false },
  { day: 4, month: 9, title: "Food", amount: 75, category: "Food & Dining", isUnnecessary: false },
  { day: 5, month: 9, title: "Food", amount: 25, category: "Food & Dining", isUnnecessary: false },
  { day: 5, month: 9, title: "Food", amount: 70, category: "Food & Dining", isUnnecessary: false },
  { day: 6, month: 9, title: "Food", amount: 35, category: "Food & Dining", isUnnecessary: false },
  { day: 7, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 7, month: 9, title: "Vegetable", amount: 70, category: "Groceries", isUnnecessary: false },
  { day: 8, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 9, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 10, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 10, month: 9, title: "Shirt", amount: 500, category: "Shopping & Clothing", isUnnecessary: true, unnecessaryReason: "Impulse shirt buy" },
  { day: 10, month: 9, title: "Soap", amount: 10, category: "Personal Care", isUnnecessary: false },
  { day: 11, month: 9, title: "Milk", amount: 20, category: "Groceries", isUnnecessary: false },
  { day: 11, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 11, month: 9, title: "Vegetable", amount: 50, category: "Groceries", isUnnecessary: false },
  { day: 12, month: 9, title: "Auto fare", amount: 25, category: "Transport & Fuel", isUnnecessary: false },
  { day: 12, month: 9, title: "Atta (Flour)", amount: 220, category: "Groceries", isUnnecessary: false },
  { day: 12, month: 9, title: "Gas (Cylinder)", amount: 200, category: "Bills & Utilities", isUnnecessary: false },
  { day: 12, month: 9, title: "Mobile Recharge", amount: 349, category: "Bills & Utilities", isUnnecessary: false },
  { day: 13, month: 9, title: "Food", amount: 65, category: "Food & Dining", isUnnecessary: false },
  { day: 14, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 14, month: 9, title: "Medicine", amount: 20, category: "Health & Medical", isUnnecessary: false },
  { day: 14, month: 9, title: "Milk", amount: 20, category: "Groceries", isUnnecessary: false },
  { day: 15, month: 9, title: "Food", amount: 55, category: "Food & Dining", isUnnecessary: false },
  { day: 15, month: 9, title: "Rent", amount: 2800, category: "Bills & Utilities", isUnnecessary: false },
  { day: 15, month: 9, title: "Medicine 💊", amount: 90, category: "Health & Medical", isUnnecessary: false },
  { day: 16, month: 9, title: "Milk", amount: 20, category: "Groceries", isUnnecessary: false },
  { day: 16, month: 9, title: "Apple 🍎", amount: 60, category: "Groceries", isUnnecessary: false },
  { day: 16, month: 9, title: "Dosa", amount: 80, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Outside restaurant food" },
  { day: 17, month: 9, title: "Auto Fare", amount: 20, category: "Transport & Fuel", isUnnecessary: false },
  { day: 17, month: 9, title: "Tea", amount: 10, category: "Food & Dining", isUnnecessary: false },
  { day: 17, month: 9, title: "Recharge (Mummy)", amount: 200, category: "Bills & Utilities", isUnnecessary: false },
  { day: 17, month: 9, title: "Daliya", amount: 35, category: "Groceries", isUnnecessary: false },
  { day: 17, month: 9, title: "Water tap", amount: 280, category: "Bills & Utilities", isUnnecessary: false },
  { day: 18, month: 9, title: "Food", amount: 85, category: "Food & Dining", isUnnecessary: false },
  { day: 18, month: 9, title: "Kiwi 🥝", amount: 90, category: "Groceries", isUnnecessary: false },
  { day: 18, month: 9, title: "Papaya", amount: 60, category: "Groceries", isUnnecessary: false },
  { day: 18, month: 9, title: "Plumber", amount: 150, category: "Bills & Utilities", isUnnecessary: false },
  { day: 19, month: 9, title: "Food", amount: 55, category: "Food & Dining", isUnnecessary: false },
  { day: 19, month: 9, title: "Vegetable", amount: 40, category: "Groceries", isUnnecessary: false },
  { day: 20, month: 9, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 21, month: 9, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 21, month: 9, title: "Coconut Water 🌴", amount: 70, category: "Health & Medical", isUnnecessary: false },
  { day: 22, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 22, month: 9, title: "Vegetable 🥦", amount: 10, category: "Groceries", isUnnecessary: false },
  { day: 23, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 23, month: 9, title: "Dinner", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 24, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 24, month: 9, title: "Tea ☕", amount: 10, category: "Food & Dining", isUnnecessary: false },
  { day: 24, month: 9, title: "Gas Cylinder", amount: 210, category: "Bills & Utilities", isUnnecessary: false },
  { day: 25, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 25, month: 9, title: "Dinner", amount: 70, category: "Food & Dining", isUnnecessary: false },
  { day: 26, month: 9, title: "Food", amount: 90, category: "Food & Dining", isUnnecessary: false },
  { day: 26, month: 9, title: "Dinner", amount: 30, category: "Food & Dining", isUnnecessary: false },
  { day: 26, month: 9, title: "Surf", amount: 10, category: "Groceries", isUnnecessary: false },
  { day: 27, month: 9, title: "Metro card", amount: 100, category: "Transport & Fuel", isUnnecessary: false },
  { day: 27, month: 9, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 27, month: 9, title: "Dinner", amount: 65, category: "Food & Dining", isUnnecessary: false },
  { day: 27, month: 9, title: "Auto fare Gurgaon", amount: 40, category: "Transport & Fuel", isUnnecessary: false },
  { day: 28, month: 9, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 29, month: 9, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 29, month: 9, title: "Vegetable", amount: 15, category: "Groceries", isUnnecessary: false },
  { day: 30, month: 9, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 30, month: 9, title: "Dinner", amount: 40, category: "Food & Dining", isUnnecessary: false },

  // BLOCK 4: October 2026 (Month 10, 1st to 17th)
  { day: 1, month: 10, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 1, month: 10, title: "Bus", amount: 200, category: "Transport & Fuel", isUnnecessary: false },
  { day: 1, month: 10, title: "Auto fare", amount: 40, category: "Transport & Fuel", isUnnecessary: false },
  { day: 1, month: 10, title: "Ice cream 🍨", amount: 100, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Sweet treat craving" },
  { day: 2, month: 10, title: "Petrol", amount: 200, category: "Transport & Fuel", isUnnecessary: false },
  { day: 2, month: 10, title: "Laptop", amount: 600, category: "Education", isUnnecessary: false },
  { day: 2, month: 10, title: "Haircut", amount: 80, category: "Personal Care", isUnnecessary: false },
  { day: 2, month: 10, title: "Cold drink", amount: 60, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Cold drink" },
  { day: 2, month: 10, title: "Parking", amount: 40, category: "Transport & Fuel", isUnnecessary: false },
  { day: 3, month: 10, title: "Clothes", amount: 3010, category: "Shopping & Clothing", isUnnecessary: true, unnecessaryReason: "Big clothes shopping" },
  { day: 3, month: 10, title: "Saari", amount: 1050, category: "Shopping & Clothing", isUnnecessary: false },
  { day: 3, month: 10, title: "Lunch Box", amount: 180, category: "Others", isUnnecessary: false },
  { day: 4, month: 10, title: "Metro recharge", amount: 200, category: "Transport & Fuel", isUnnecessary: false },
  { day: 4, month: 10, title: "Bus", amount: 200, category: "Transport & Fuel", isUnnecessary: false },
  { day: 4, month: 10, title: "Rapido", amount: 43, category: "Transport & Fuel", isUnnecessary: false },
  { day: 4, month: 10, title: "Food", amount: 55, category: "Food & Dining", isUnnecessary: false },
  { day: 4, month: 10, title: "Dinner", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 4, month: 10, title: "Auto Fare", amount: 80, category: "Transport & Fuel", isUnnecessary: false },
  { day: 5, month: 10, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 6, month: 10, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 6, month: 10, title: "Gas Cylinder", amount: 200, category: "Bills & Utilities", isUnnecessary: false },
  { day: 6, month: 10, title: "Vegetable", amount: 15, category: "Groceries", isUnnecessary: false },
  { day: 7, month: 10, title: "Food", amount: 60, category: "Food & Dining", isUnnecessary: false },
  { day: 7, month: 10, title: "Dinner", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 8, month: 10, title: "Breakfast", amount: 15, category: "Food & Dining", isUnnecessary: false },
  { day: 8, month: 10, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 9, month: 10, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 9, month: 10, title: "Snacks", amount: 15, category: "Food & Dining", isUnnecessary: true, unnecessaryReason: "Packaged snack" },
  { day: 10, month: 10, title: "Curd", amount: 35, category: "Groceries", isUnnecessary: false },
  { day: 10, month: 10, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 10, month: 10, title: "Dinner", amount: 80, category: "Food & Dining", isUnnecessary: false },
  { day: 11, month: 10, title: "Food", amount: 70, category: "Food & Dining", isUnnecessary: false },
  { day: 11, month: 10, title: "Curd", amount: 10, category: "Groceries", isUnnecessary: false },
  { day: 12, month: 10, title: "Food", amount: 100, category: "Food & Dining", isUnnecessary: false },
  { day: 13, month: 10, title: "Food", amount: 40, category: "Food & Dining", isUnnecessary: false },
  { day: 13, month: 10, title: "Dinner", amount: 55, category: "Food & Dining", isUnnecessary: false },
  { day: 14, month: 10, title: "Food", amount: 50, category: "Food & Dining", isUnnecessary: false },
  { day: 14, month: 10, title: "Farewell (Office)", amount: 100, category: "Others", isUnnecessary: false },
  { day: 14, month: 10, title: "Room Rent", amount: 2900, category: "Bills & Utilities", isUnnecessary: false },
  { day: 15, month: 10, title: "Recharge (Deepika)", amount: 300, category: "Bills & Utilities", isUnnecessary: false },
  { day: 15, month: 10, title: "Recharge (Ayush)", amount: 349, category: "Bills & Utilities", isUnnecessary: false },
  { day: 15, month: 10, title: "Tea", amount: 10, category: "Food & Dining", isUnnecessary: false },
  { day: 16, month: 10, title: "Food", amount: 45, category: "Food & Dining", isUnnecessary: false },
  { day: 17, month: 10, title: "Rapido to paytm", amount: 54, category: "Transport & Fuel", isUnnecessary: false },
  { day: 17, month: 10, title: "Rapido", amount: 57, category: "Transport & Fuel", isUnnecessary: false },
  { day: 17, month: 10, title: "Shoes 👟", amount: 1000, category: "Shopping & Clothing", isUnnecessary: true, unnecessaryReason: "Shoes purchase" },
  { day: 17, month: 10, title: "Metro Recharge", amount: 101, category: "Transport & Fuel", isUnnecessary: false },
  { day: 17, month: 10, title: "Dinner", amount: 35, category: "Food & Dining", isUnnecessary: false },
];

const year = 2026;

// Format into model objects
const formattedExpenses = rawExpenses.map((item, idx) => {
  const d = new Date(year, item.month - 1, item.day, 12, 0, 0);
  return {
    _id: `user_${item.month}_${item.day}_${idx}`,
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    isUnnecessary: Boolean(item.isUnnecessary),
    unnecessaryReason: item.unnecessaryReason || '',
    date: d.toISOString(),
    paymentMethod: item.title.toLowerCase().includes('cash') ? 'Cash' : 'UPI / Online'
  };
});

async function run() {
  console.log(`Parsed ${formattedExpenses.length} real expenses across July, August, September, and October 2026.`);

  // 1. Save directly to frontend default data file
  const frontendDataPath = path.join(__dirname, '..', 'frontend', 'src', 'services', 'userExpenses.json');
  fs.writeFileSync(frontendDataPath, JSON.stringify(formattedExpenses, null, 2));
  console.log(`✅ Saved userExpenses.json to frontend!`);

  // 2. Insert into MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found, skipping DB insertion.');
    process.exit(0);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas!');

    // Clear old sample/seed data
    await Expense.deleteMany({});
    console.log('Cleared old expenses.');

    // Insert user's real expenses
    const dbExpenses = formattedExpenses.map(e => ({
      title: e.title,
      amount: e.amount,
      category: e.category,
      isUnnecessary: e.isUnnecessary,
      unnecessaryReason: e.unnecessaryReason,
      date: new Date(e.date),
      paymentMethod: e.paymentMethod,
    }));

    await Expense.insertMany(dbExpenses);
    console.log(`🎉 Successfully inserted ${dbExpenses.length} real expenses into MongoDB Atlas!`);
  } catch (err) {
    console.error('MongoDB Atlas insertion error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  }
}

run();
