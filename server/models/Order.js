const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    trim: true,
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Customer address is required'],
      trim: true,
    },
    location: {
      type: String,
      enum: ['inside_dhaka', 'outside_dhaka'],
      required: [true, 'Customer location is required'],
    },
  },
  items: {
    type: [orderItemSchema],
    default: [],
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bkash', 'nagad'],
    default: 'cod',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  trackingCompany: {
    type: String,
    enum: ['pathao', 'steadfast', 'redx'],
  },
  notes: {
    type: String,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', async function saveHook(next) {
  if (this.orderId) {
    return next();
  }

  try {
    const Order = this.constructor;
    let unique = false;

    while (!unique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
      const candidate = `GLS-${randomDigits}`;
      const existingOrder = await Order.findOne({ orderId: candidate }).select('_id');

      if (!existingOrder) {
        this.orderId = candidate;
        unique = true;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', orderSchema);
