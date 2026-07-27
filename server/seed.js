require('dotenv').config();

const mongoose = require('mongoose');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
};

const productData = [
  {
    name: 'Radiant Glow Vitamin C Serum',
    description: 'A lightweight brightening serum with vitamin C and niacinamide for everyday glow.',
    price: 1450,
    comparePrice: 1650,
    category: 'skincare',
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
    ],
    badge: 'Bestseller',
    discount: 12,
    rating: 4.8,
    reviewCount: 320,
    isFeatured: true,
  },
  {
    name: 'Dew Drop Aloe Hydration Gel',
    description: 'Cooling aloe gel moisturizer perfect for humid Bangladeshi weather and sensitive skin.',
    price: 780,
    comparePrice: 900,
    category: 'skincare',
    stock: 70,
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b',
      'https://images.unsplash.com/photo-1617897903246-719242758050',
    ],
    badge: 'New Arrival',
    discount: 8,
    rating: 4.5,
    reviewCount: 188,
    isFeatured: false,
  },
  {
    name: 'Silk Matte Longwear Lipstick - Rose Jamdani',
    description: 'Rich matte lipstick inspired by classic Bangla rose tones with all-day comfort.',
    price: 950,
    comparePrice: 1100,
    category: 'makeup',
    stock: 90,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
    ],
    badge: 'Hot Deal',
    discount: 14,
    rating: 4.7,
    reviewCount: 410,
    isFeatured: true,
  },
  {
    name: 'Luminous Coverage Cushion Foundation',
    description: 'Breathable medium-coverage cushion foundation with a smooth satin finish.',
    price: 1850,
    comparePrice: 2100,
    category: 'makeup',
    stock: 42,
    images: [
      'https://images.unsplash.com/photo-1631214540242-6ed4d55d9516',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
    ],
    badge: 'Editor Pick',
    discount: 10,
    rating: 4.6,
    reviewCount: 260,
    isFeatured: false,
  },
  {
    name: 'Noor Oud Bloom Perfume Mist',
    description: 'A soft floral oud body mist that blends elegance with long-lasting freshness.',
    price: 2200,
    comparePrice: 2500,
    category: 'fragrance',
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f',
    ],
    badge: 'Signature Scent',
    discount: 12,
    rating: 4.9,
    reviewCount: 145,
    isFeatured: true,
  },
  {
    name: 'Monsoon Fresh Citrus Cologne',
    description: 'Zesty citrus cologne crafted for daily wear with a clean refreshing dry-down.',
    price: 1680,
    comparePrice: 1900,
    category: 'fragrance',
    stock: 46,
    images: [
      'https://images.unsplash.com/photo-1595425964071-7f97d8f0d2aa',
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de',
    ],
    badge: 'Customer Favorite',
    discount: 11,
    rating: 4.4,
    reviewCount: 97,
    isFeatured: false,
  },
  {
    name: 'Black Seed Nourish Hair Oil',
    description: 'A nutrient-rich black seed and argan oil blend for stronger shinier hair.',
    price: 620,
    comparePrice: 700,
    category: 'haircare',
    stock: 85,
    images: [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108',
    ],
    badge: 'Herbal Care',
    discount: 6,
    rating: 4.3,
    reviewCount: 205,
    isFeatured: false,
  },
  {
    name: 'Keratin Smooth Repair Shampoo Set',
    description: 'Salon-style keratin shampoo and conditioner duo for frizz control and softness.',
    price: 3150,
    comparePrice: 3500,
    category: 'haircare',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388',
      'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd',
    ],
    badge: 'Limited Stock',
    discount: 10,
    rating: 4.7,
    reviewCount: 122,
    isFeatured: true,
  },
];

const createSampleOrders = (products) => {
  const [p1, p2, p3, p4, p5, p6, p7, p8] = products;

  return [
    {
      customer: {
        name: 'Nusrat Jahan',
        phone: '01712345678',
        address: 'House 12, Road 7, Dhanmondi',
        location: 'inside_dhaka',
      },
      items: [
        { product: p1._id, name: p1.name, price: p1.price, quantity: 1, image: p1.images[0] },
        { product: p3._id, name: p3.name, price: p3.price, quantity: 2, image: p3.images[0] },
      ],
      subtotal: p1.price + p3.price * 2,
      deliveryFee: 60,
      total: p1.price + p3.price * 2 + 60,
      paymentMethod: 'cod',
      status: 'pending',
      notes: 'Please call before delivery.',
      createdAt: new Date(),
    },
    {
      customer: {
        name: 'Farhana Akter',
        phone: '01812345678',
        address: 'West Kazipara, Mirpur',
        location: 'inside_dhaka',
      },
      items: [
        { product: p2._id, name: p2.name, price: p2.price, quantity: 1, image: p2.images[0] },
        { product: p7._id, name: p7.name, price: p7.price, quantity: 2, image: p7.images[0] },
      ],
      subtotal: p2.price + p7.price * 2,
      deliveryFee: 60,
      total: p2.price + p7.price * 2 + 60,
      paymentMethod: 'bkash',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      customer: {
        name: 'Sharmin Sultana',
        phone: '01912345678',
        address: 'Police Line, Rajshahi',
        location: 'outside_dhaka',
      },
      items: [
        { product: p4._id, name: p4.name, price: p4.price, quantity: 1, image: p4.images[0] },
        { product: p6._id, name: p6.name, price: p6.price, quantity: 1, image: p6.images[0] },
      ],
      subtotal: p4.price + p6.price,
      deliveryFee: 120,
      total: p4.price + p6.price + 120,
      paymentMethod: 'nagad',
      status: 'processing',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      customer: {
        name: 'Mehjabin Rahman',
        phone: '01612345678',
        address: 'Bagmara, Chattogram',
        location: 'outside_dhaka',
      },
      items: [
        { product: p5._id, name: p5.name, price: p5.price, quantity: 1, image: p5.images[0] },
        { product: p8._id, name: p8.name, price: p8.price, quantity: 1, image: p8.images[0] },
      ],
      subtotal: p5.price + p8.price,
      deliveryFee: 120,
      total: p5.price + p8.price + 120,
      paymentMethod: 'cod',
      status: 'shipped',
      trackingCompany: 'pathao',
      trackingNumber: 'PATHAO12345678',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      customer: {
        name: 'Tasnia Karim',
        phone: '01512345678',
        address: 'Shibbari Mor, Khulna',
        location: 'outside_dhaka',
      },
      items: [
        { product: p1._id, name: p1.name, price: p1.price, quantity: 1, image: p1.images[0] },
        { product: p5._id, name: p5.name, price: p5.price, quantity: 1, image: p5.images[0] },
      ],
      subtotal: p1.price + p5.price,
      deliveryFee: 120,
      total: p1.price + p5.price + 120,
      paymentMethod: 'bkash',
      status: 'delivered',
      trackingCompany: 'steadfast',
      trackingNumber: 'STEADFAST87654321',
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
  ];
};

const seedDatabase = async () => {
  try {
    console.log('Starting Glowsiaa database seed...');
    await connectDatabase();

    console.log('Clearing existing collections...');
    await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

    console.log('Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@glowsiaa.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`Admin created: ${adminUser.email}`);

    console.log('Creating products...');
    const products = await Product.insertMany(productData);
    console.log(`Created ${products.length} products`);

    console.log('Creating sample orders...');
    const orders = [];
    for (const orderData of createSampleOrders(products)) {
      const order = await Order.create(orderData);
      orders.push(order);
    }
    console.log(`Created ${orders.length} sample orders`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('authentication failed')) {
      console.error('--------------------------------------------------');
      console.error('DATABASE AUTHENTICATION FAILED');
      console.error('--------------------------------------------------');
      console.error('This is an issue with the credentials in your .env file.');
      console.error('Please check the following:');
      console.error('1. File Location: Make sure you have a .env file in the `server/` directory.');
      console.error('2. Credentials: In your .env file, verify the MONGO_URI is correct.');
      console.error('   - Check the username and password.');
      console.error('   - IMPORTANT: Use the DATABASE USER password, not your MongoDB Atlas account password.');
      console.error('3. Special Characters: If your password has special characters like @, :, #, or ?, they MUST be URL-encoded.');
      console.error('   - Example: a password like "my#pass" should be written as "my%23pass".');
      console.error('4. IP Access: In MongoDB Atlas, go to "Network Access" and ensure your current IP address is whitelisted.');
      console.error('   - For testing, you can temporarily allow access from anywhere with 0.0.0.0/0, but this is not secure.');
      console.error('--------------------------------------------------');
    } else {
      console.error('Seed failed:', error);
    }
    process.exit(1);
  }
};

seedDatabase();