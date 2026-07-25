import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";
import { OrderArchive } from "../models/OrderArchive.js";

dotenv.config();

const STORES = [
  "pune_fc_road",
  "pune_kothrud",
  "pune_camp",
  "pune_viman_nagar",
];

const SAMPLE_ITEMS = [
  { item_id: "ITEM-001", item_name: "Special Puneri Misal Pav", price: 90 },
  { item_id: "ITEM-002", item_name: "Hot Kanda Poha", price: 30 },
  { item_id: "ITEM-003", item_name: "Crispy Vada Pav", price: 20 },
  { item_id: "ITEM-004", item_name: "Chitale Special Bhakarwadi", price: 60 },
  { item_id: "ITEM-005", item_name: "Mango Mastani", price: 120 },
  { item_id: "ITEM-006", item_name: "Sabudana Vada", price: 50 },
  { item_id: "ITEM-007", item_name: "Puran Poli with Ghee", price: 70 },
  { item_id: "ITEM-008", item_name: "Ukdiche Modak", price: 80 },
  { item_id: "ITEM-009", item_name: "Bun Maska & Irani Chai", price: 45 },
  { item_id: "ITEM-010", item_name: "Pithla Bhakri Thali", price: 110 },
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
