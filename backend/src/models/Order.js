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

const orderSchema = new mongoose.Schema(
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
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'Order must contain at least one item',
      ],
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PLACED', 'PREPARING', 'COMPLETED'],
      default: 'PLACED',
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound Index for fast paginated queries filtering by store and sorted by newest first
orderSchema.index({ store_id: 1, created_at: -1 });

export const Order = mongoose.model('Order', orderSchema);
