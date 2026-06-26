const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Office Supplies',
        'Travel',
        'Meals',
        'Software Subscription',
        'Utilities',
        'Marketing',
        'Payroll',
        'Cloud Hosting',
        'Hardware',
        'Internet',
        'Training',
        'Client Meeting',
        'Miscellaneous',
      ],
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Company Card', 'Online Payment'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    project: {
      type: String,
      default: '',
      trim: true,
    },
    client: {
      type: String,
      default: '',
      trim: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    invoiceUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectReason: {
      type: String,
      default: '',
    },

    // Multi-tenant zaroori fields
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);