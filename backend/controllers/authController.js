const { auth } = require('../config/firebase');
const User = require('../models/User');
const Company = require('../models/Company');

const generateCompanyCode = (companyName) => {
  const prefix = companyName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`;
};

// Naya company banao + admin user banao
const registerCompany = async (req, res) => {
  try {
    const { name, email, companyName } = req.body;

    // req.user already authMiddleware se mil gaya hai (token verify ho chuka hai)
    const firebaseUid = req.user.uid;

    const companyCode = generateCompanyCode(companyName);
    const company = await Company.create({
      name: companyName,
      companyCode,
    });

    const user = await User.create({
      firebaseUid,
      name,
      email,
      role: 'admin',
      companyId: company._id,
    });

    company.createdBy = user._id;
    await company.save();

    res.status(201).json({ user, company });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Existing company join karo
const joinCompany = async (req, res) => {
  try {
    const { name, email, companyCode, role } = req.body;
    const firebaseUid = req.user.uid;

    if (!['employee', 'accountant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const company = await Company.findOne({ companyCode });
    if (!company) {
      return res.status(404).json({ message: 'Invalid company code' });
    }

    const user = await User.create({
      firebaseUid,
      name,
      email,
      role,
      companyId: company._id,
    });

    res.status(201).json({ user, company });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
  const getMe = async (req, res) => {
  try {
    const user = await req.user.populate('companyId');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompanyUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId }).select('-firebaseUid');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const removeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToRemove = await User.findById(id);
    if (!userToRemove) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sirf apni company ka user remove kar sakte hain
    if (String(userToRemove.companyId) !== String(req.user.companyId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Admin khud ko remove nahi kar sakta
    if (String(userToRemove._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { monthlyBudget },
      { new: true }
    );
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



const addUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['employee', 'accountant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Firebase mein account banao
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // MongoDB mein user banao
    const user = await User.create({
      firebaseUid: firebaseUser.uid,
      name,
      email,
      role,
      companyId: req.user.companyId,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { registerCompany, joinCompany, getMe, getCompanyUsers, removeUser, updateBudget, addUserByAdmin };