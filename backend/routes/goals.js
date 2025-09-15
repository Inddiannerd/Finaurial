const express = require('express');
const router = express.Router();
const { getGoals, addGoal, updateGoal, deleteGoal } = require('../controllers/goalsController');
const auth = require('../middleware/auth');

router.route('/').get(auth, getGoals).post(auth, addGoal);
router.route('/:id').put(auth, updateGoal).delete(auth, deleteGoal);

module.exports = router;