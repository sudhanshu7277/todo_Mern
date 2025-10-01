const mongoose = require('mongoose');

const employmentSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['employed', 'self-employed', 'unemployed'],
    required: true,
  },
  employer: String,
  employmentType: String,
  company: String,
  businessType: String,
  unemployedSince: Date,
  designation: String,
  income: Number,
});

const incomeSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['employee', 'self-employed'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const userDataSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  identificationNumber: {
    type: String,
    required: true,
  },
  employments: [employmentSchema],
  incomes: [incomeSchema],
  totalIncome: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Pre-save hook to compute totalIncome
userDataSchema.pre('save', function (next) {
  this.totalIncome = this.incomes.reduce((total, inc) => total + (inc.amount || 0), 0);
  next();
});

module.exports = mongoose.model('UserData', userDataSchema);