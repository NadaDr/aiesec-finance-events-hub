// server/seed_demo.js
// Seeds demonstration user, events, and transactions based on Section 11 of the Cahier des Charges

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Event = require('./models/Event');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');

const DEFAULT_CATEGORIES = [
  // Revenue categories
  { name: 'Sponsorship', type: 'revenue' },
  { name: 'Ticket Sales', type: 'revenue' },
  { name: 'Registration Fees', type: 'revenue' },
  { name: 'Booth Fees', type: 'revenue' },
  { name: 'Donations', type: 'revenue' },
  // Expense categories
  { name: 'Venue Rental', type: 'expense' },
  { name: 'Marketing', type: 'expense' },
  { name: 'Transportation', type: 'expense' },
  { name: 'Catering', type: 'expense' },
  { name: 'Decoration', type: 'expense' },
  { name: 'Equipment', type: 'expense' }
];

async function seedData() {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB Atlas. Preparing sample demonstration data...');

    // 1. Ensure categories are created
    for (const cat of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: cat.name, type: cat.type },
        cat,
        { upsert: true, new: true }
      );
    }
    const categories = await Category.find();
    console.log(`[Seed] ${categories.length} categories verified in database.`);

    const catMap = {};
    categories.forEach((c) => {
      catMap[`${c.name.toLowerCase()}_${c.type}`] = c._id;
    });

    // 2. Create demo user
    const demoEmail = 'demo@aiesec.net';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Nada Dridi',
        email: demoEmail,
        password: 'password123'
      });
      console.log('[Seed] Created demo user: demo@aiesec.net (password: password123)');
    } else {
      console.log('[Seed] Demo user already exists.');
    }

    // 3. Clear previous demo events & transactions for this user
    const existingEvents = await Event.find({ createdBy: demoUser._id });
    const eventIds = existingEvents.map((e) => e._id);
    await Transaction.deleteMany({ event: { $in: eventIds } });
    await Event.deleteMany({ createdBy: demoUser._id });
    console.log('[Seed] Cleared old demo records for fresh demonstration.');

    // 4. Create Event 1: Global Village 2026 (Directly from Cahier des Charges section 11)
    const globalVillage = await Event.create({
      name: 'Global Village 2026',
      description: 'Annual cultural festival celebrating cultural diversity, leadership, and global understanding.',
      location: 'Sousse, Tunisia',
      startDate: new Date('2026-05-15'),
      endDate: new Date('2026-05-17'),
      budget: 5000,
      createdBy: demoUser._id
    });

    // Transactions for Global Village 2026:
    // Revenues (Total: 6,000 TND)
    await Transaction.create([
      {
        event: globalVillage._id,
        category: catMap['sponsorship_revenue'],
        type: 'revenue',
        description: 'Main Corporate Sponsorship',
        amount: 3000,
        date: new Date('2026-05-02'),
        createdBy: demoUser._id
      },
      {
        event: globalVillage._id,
        category: catMap['ticket sales_revenue'],
        type: 'revenue',
        description: 'Attendee Ticket Sales (Pre-orders & onsite)',
        amount: 2000,
        date: new Date('2026-05-15'),
        createdBy: demoUser._id
      },
      {
        event: globalVillage._id,
        category: catMap['booth fees_revenue'],
        type: 'revenue',
        description: 'International Cultural Booth Rental Fees',
        amount: 1000,
        date: new Date('2026-05-10'),
        createdBy: demoUser._id
      },
      // Expenses (Total: 2,000 TND)
      {
        event: globalVillage._id,
        category: catMap['venue rental_expense'],
        type: 'expense',
        description: 'Cultural Pavilion Hall Rental',
        amount: 1200,
        date: new Date('2026-05-01'),
        createdBy: demoUser._id
      },
      {
        event: globalVillage._id,
        category: catMap['decoration_expense'],
        type: 'expense',
        description: 'Traditional Decor, Flags & Lighting',
        amount: 500,
        date: new Date('2026-05-12'),
        createdBy: demoUser._id
      },
      {
        event: globalVillage._id,
        category: catMap['marketing_expense'],
        type: 'expense',
        description: 'Social Media Promotion & Flyers',
        amount: 300,
        date: new Date('2026-05-05'),
        createdBy: demoUser._id
      }
    ]);
    console.log('[Seed] Event 1 Created: "Global Village 2026" (Revenue: 6000 TND, Expenses: 2000 TND, Balance: +4000 TND)');

    // 5. Create Event 2: Career Fair 2026
    const careerFair = await Event.create({
      name: 'Career Fair 2026',
      description: 'Connecting top corporate partners and innovative startups with talented students and young graduates.',
      location: 'Tunis, Tunisia',
      startDate: new Date('2026-03-20'),
      endDate: new Date('2026-03-21'),
      budget: 4000,
      createdBy: demoUser._id
    });

    await Transaction.create([
      {
        event: careerFair._id,
        category: catMap['sponsorship_revenue'],
        type: 'revenue',
        description: 'Gold & Silver Company Sponsorship Packages',
        amount: 4500,
        date: new Date('2026-03-05'),
        createdBy: demoUser._id
      },
      {
        event: careerFair._id,
        category: catMap['booth fees_revenue'],
        type: 'revenue',
        description: 'Corporate Recruitment Booth Stands',
        amount: 1500,
        date: new Date('2026-03-12'),
        createdBy: demoUser._id
      },
      {
        event: careerFair._id,
        category: catMap['venue rental_expense'],
        type: 'expense',
        description: 'Conference Center Convention Hall',
        amount: 2000,
        date: new Date('2026-03-01'),
        createdBy: demoUser._id
      },
      {
        event: careerFair._id,
        category: catMap['marketing_expense'],
        type: 'expense',
        description: 'Campus Banners, Rollups & Media Ads',
        amount: 800,
        date: new Date('2026-03-10'),
        createdBy: demoUser._id
      },
      {
        event: careerFair._id,
        category: catMap['catering_expense'],
        type: 'expense',
        description: 'Coffee Breaks & Speaker Luncheon',
        amount: 700,
        date: new Date('2026-03-20'),
        createdBy: demoUser._id
      }
    ]);
    console.log('[Seed] Event 2 Created: "Career Fair 2026" (Revenue: 6000 TND, Expenses: 3500 TND, Balance: +2500 TND)');

    // 6. Create Event 3: Leadership Development Conference 2026
    const ldc = await Event.create({
      name: 'Leadership Conference 2026',
      description: 'Intensive 3-day leadership simulation, team workshops, and strategic organizational planning.',
      location: 'Hammamet, Tunisia',
      startDate: new Date('2026-11-20'),
      endDate: new Date('2026-11-22'),
      budget: 8000,
      createdBy: demoUser._id
    });

    await Transaction.create([
      {
        event: ldc._id,
        category: catMap['registration fees_revenue'],
        type: 'revenue',
        description: 'Delegate Registration Packages (60 delegates)',
        amount: 5000,
        date: new Date('2026-11-01'),
        createdBy: demoUser._id
      },
      {
        event: ldc._id,
        category: catMap['sponsorship_revenue'],
        type: 'revenue',
        description: 'Youth Development Grant Sponsor',
        amount: 3000,
        date: new Date('2026-11-05'),
        createdBy: demoUser._id
      },
      {
        event: ldc._id,
        category: catMap['venue rental_expense'],
        type: 'expense',
        description: 'Hotel Plenary Hall & Workshop Rooms',
        amount: 4500,
        date: new Date('2026-11-02'),
        createdBy: demoUser._id
      },
      {
        event: ldc._id,
        category: catMap['catering_expense'],
        type: 'expense',
        description: 'Full Board Catering (3 Days)',
        amount: 2500,
        date: new Date('2026-11-20'),
        createdBy: demoUser._id
      },
      {
        event: ldc._id,
        category: catMap['transportation_expense'],
        type: 'expense',
        description: 'Bus Transportation for Delegates',
        amount: 1500,
        date: new Date('2026-11-19'),
        createdBy: demoUser._id
      }
    ]);
    console.log('[Seed] Event 3 Created: "Leadership Conference 2026" (Revenue: 8000 TND, Expenses: 8500 TND, Balance: -500 TND)');

    console.log('\n======================================================');
    console.log('   SAMPLE DEMO DATA SEEDED SUCCESSFULLY!             ');
    console.log('======================================================');
    console.log('Credentials to log in:');
    console.log('   Email:    demo@aiesec.net');
    console.log('   Password: password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedData();

