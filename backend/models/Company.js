const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyCode: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    monthlyBudget: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);