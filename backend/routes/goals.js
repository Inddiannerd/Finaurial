const express = require('express');
const router = express.Router();
const { getGoals, addGoal, updateGoal, deleteGoal, addContribution } = require('../controllers/goalsController');
const auth = require('../middleware/auth');

router.route('/').get(auth, getGoals).post(auth, addGoal);
router.route('/:id').put(auth, updateGoal).delete(auth, deleteGoal);
router.route('/:id/contribute').post(auth, addContribution);

module.exports = router;