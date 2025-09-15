const express = require('express');
const router = express.Router();
const { getBudgets, addBudget, updateBudget, deleteBudget } = require('../controllers/Budgetscontroller');
const auth = require('../middleware/auth');

router.route('/').get(auth, getBudgets).post(auth, addBudget);
router.route('/:id').put(auth, updateBudget).delete(auth, deleteBudget);

module.exports = router;