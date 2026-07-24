import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    item_id: { type: String, required: true },
    item_name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderArchiveSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    store_id: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PLACED', 'PREPARING', 'COMPLETED'],
      required: true,
    },
    created_at: {
      type: Date,
      required: true,
      index: true,
    },
    archived_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

orderArchiveSchema.index({ store_id: 1, created_at: -1 });

export const OrderArchive = mongoose.model('OrderArchive', orderArchiveSchema);
