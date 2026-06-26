const express = require('express');
const router = express.Router();
const { registerCompany, joinCompany, getMe, getCompanyUsers, removeUser, updateBudget, addUserByAdmin } = require('../controllers/authController');
const { verifyFirebaseToken, protect, authorize } = require('../middleware/authMiddleware');

router.post('/register-company', verifyFirebaseToken, registerCompany);
router.post('/join-company', verifyFirebaseToken, joinCompany);
router.get('/me', protect, getMe);
router.get('/users', protect, getCompanyUsers);
router.delete('/users/:id', protect, authorize('admin'), removeUser);
router.put('/budget', protect, authorize('admin'), updateBudget);
router.post('/users', protect, authorize('admin'), addUserByAdmin);

module.exports = router;