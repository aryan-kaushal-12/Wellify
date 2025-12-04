const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connect error', err);
    process.exit(1);
  }
};

module.exports = connectDB;
