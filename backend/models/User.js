const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  refreshTokens: [{ token: String, createdAt: Date }]
}, { timestamps: true });

module.exports = mongoose.model('User', schema);
