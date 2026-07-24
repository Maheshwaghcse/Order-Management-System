import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";
import { OrderArchive } from "../models/OrderArchive.js";

dotenv.config();

const STORES = [
  "store_downtown",
  "store_uptown",
  "store_suburbs",
  "store_airport",
];

const SAMPLE_ITEMS = [
  { item_id: "ITEM-001", item_name: "Artisanal Espresso", price: 4.5 },
  { item_id: "ITEM-002", item_name: "Avocado Sourdough Toast", price: 12.0 },
  { item_id: "ITEM-003", item_name: "Cold Brew Coffee", price: 5.5 },
  { item_id: "ITEM-004", item_name: "Matcha Latte", price: 6.0 },
  { item_id: "ITEM-005", item_name: "Truffle Mushroom Burger", price: 18.5 },
  { item_id: "ITEM-006", item_name: "Crispy French Fries", price: 6.5 },
  { item_id: "ITEM-007", item_name: "Acai Superfood Bowl", price: 13.5 },
  { item_id: "ITEM-008", item_name: "Fresh Croissant", price: 4.0 },
];

const STATUSES = ["PLACED", "PREPARING", "COMPLETED"];

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    console.log(`[Seed] Connecting to MongoDB: ${connStr}...`);
    await mongoose.connect(connStr);

    console.log("[Seed] Clearing existing Order and OrderArchive data...");
    await Order.deleteMany({});
    await OrderArchive.deleteMany({});

    console.log("[Seed] Generating sample orders over the last 60 days...");

    const ordersToInsert = [];
    const now = new Date();

    // Create 150 realistic orders spread over the past 60 days
    for (let i = 0; i < 150; i++) {
      const storeId = getRandomElement(STORES);

      // Random days ago between 0 and 55 days
      const daysAgo = getRandomInt(0, 55);
      const hoursAgo = getRandomInt(0, 23);
      const minsAgo = getRandomInt(0, 59);

      const createdDate = new Date(
        now.getTime() -
          daysAgo * 24 * 60 * 60 * 1000 -
          hoursAgo * 60 * 60 * 1000 -
          minsAgo * 60 * 1000,
      );

      // Pick 1 to 4 items per order
      const itemNum = getRandomInt(1, 4);
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < itemNum; j++) {
        const itemTemplate = getRandomElement(SAMPLE_ITEMS);
        const qty = getRandomInt(1, 3);
        const itemPrice = itemTemplate.price;

        orderItems.push({
          item_id: itemTemplate.item_id,
          item_name: itemTemplate.item_name,
          price: itemPrice,
          qty,
        });

        totalAmount += itemPrice * qty;
      }

      // Older orders are mostly completed, newer ones can be placed/preparing
      let status = "COMPLETED";
      if (daysAgo < 2) {
        status = getRandomElement(STATUSES);
      }

      const orderId = `ORD-SEED-${(i + 1).toString().padStart(4, "0")}`;

      ordersToInsert.push({
        id: orderId,
        store_id: storeId,
        items: orderItems,
        total_amount: Math.round(totalAmount * 100) / 100,
        status,
        created_at: createdDate,
      });
    }

    const inserted = await Order.insertMany(ordersToInsert);
    console.log(
      `[Seed] Successfully seeded ${inserted.length} orders across ${STORES.length} stores!`,
    );

    // Print summary stats
    const olderThan30Days = inserted.filter(
      (o) => o.created_at < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    ).length;

    console.log(
      `[Seed] Active Orders: ${inserted.length} (Eligible for archival >30 days: ${olderThan30Days})`,
    );

    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
