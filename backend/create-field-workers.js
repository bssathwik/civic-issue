// Script to create field workers in Bhimavaram
// Bhimavaram coordinates: approximately 16.5449° N, 81.5212° E

const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const fieldWorkers = [
  {
    name: 'Ravi Kumar Reddy',
    email: 'ravi.reddy@bhimavaramworks.gov.in',
    password: 'FieldWorker@123',
    phone: '+919876543210',
    role: 'field_worker',
    location: {
      type: 'Point',
      coordinates: [81.5212, 16.5449] // Bhimavaram center
    },
    address: {
      street: 'Main Road, Near Government Hospital',
      city: 'Bhimavaram',
      state: 'Andhra Pradesh',
      pincode: '534201',
      ward: 'Ward 15',
      area: 'Government Colony',
      landmark: 'Near Government Hospital',
      full: 'Main Road, Near Government Hospital, Government Colony, Ward 15, Bhimavaram, Andhra Pradesh - 534201'
    },
    citizenProfile: {
      gender: 'male',
      occupation: 'Road Maintenance Supervisor',
      isProfileComplete: true,
      profileCompleteness: 100
    },
    isVerified: true,
    isActive: true
  },
  {
    name: 'Lakshmi Devi Patel',
    email: 'lakshmi.patel@bhimavaramworks.gov.in',
    password: 'FieldWorker@123',
    phone: '+919876543211',
    role: 'field_worker',
    location: {
      type: 'Point',
      coordinates: [81.5298, 16.5402] // Slightly east of center
    },
    address: {
      street: 'Water Works Road, Sector 7',
      city: 'Bhimavaram',
      state: 'Andhra Pradesh',
      pincode: '534202',
      ward: 'Ward 8',
      area: 'Water Works Colony',
      landmark: 'Near Water Treatment Plant',
      full: 'Water Works Road, Sector 7, Water Works Colony, Ward 8, Bhimavaram, Andhra Pradesh - 534202'
    },
    citizenProfile: {
      gender: 'female',
      occupation: 'Water & Sanitation Specialist',
      isProfileComplete: true,
      profileCompleteness: 100
    },
    isVerified: true,
    isActive: true
  },
  {
    name: 'Venkata Sai Krishna',
    email: 'sai.krishna@bhimavaramworks.gov.in',
    password: 'FieldWorker@123',
    phone: '+919876543212',
    role: 'field_worker',
    location: {
      type: 'Point',
      coordinates: [81.5126, 16.5496] // Slightly west and north
    },
    address: {
      street: 'Electrical Division, Industrial Area',
      city: 'Bhimavaram',
      state: 'Andhra Pradesh',
      pincode: '534203',
      ward: 'Ward 12',
      area: 'Industrial Area',
      landmark: 'Near Electrical Sub-Station',
      full: 'Electrical Division, Industrial Area, Ward 12, Bhimavaram, Andhra Pradesh - 534203'
    },
    citizenProfile: {
      gender: 'male',
      occupation: 'Electrical Maintenance Technician',
      isProfileComplete: true,
      profileCompleteness: 100
    },
    isVerified: true,
    isActive: true
  }
];

async function createFieldWorkers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if workers already exist
    for (const worker of fieldWorkers) {
      const existingWorker = await User.findOne({ email: worker.email });
      if (existingWorker) {
        console.log(`Worker ${worker.name} already exists with email ${worker.email}`);
        continue;
      }

      // Create new field worker
      const newWorker = new User(worker);
      await newWorker.save();
      console.log(`✅ Created field worker: ${worker.name} (${worker.citizenProfile.occupation})`);
      console.log(`   📍 Location: ${worker.address.full}`);
      console.log(`   📧 Email: ${worker.email}`);
      console.log(`   📱 Phone: ${worker.phone}`);
      console.log('');
    }

    console.log('🎉 All field workers created successfully!');
    
    // Display summary
    const allFieldWorkers = await User.find({ role: 'field_worker' }).select('name email citizenProfile.occupation location address.city');
    console.log('\n📊 Summary of all field workers:');
    allFieldWorkers.forEach((worker, index) => {
      console.log(`${index + 1}. ${worker.name} - ${worker.citizenProfile.occupation} (${worker.address.city})`);
    });

  } catch (error) {
    console.error('❌ Error creating field workers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createFieldWorkers();
}

module.exports = { createFieldWorkers, fieldWorkers };