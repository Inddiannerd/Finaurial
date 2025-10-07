const express = require('express');
const router = express.Router();
const { getSavings, addSaving, getSavingsSummary, deleteSaving, clearSavings } = require('../controllers/savingsController');
const auth = require('../middleware/auth');

router.route('/').get(auth, getSavings).post(auth, addSaving).delete(auth, clearSavings);
router.route('/:id').delete(auth, deleteSaving);
router.route('/summary').get(auth, getSavingsSummary);

module.exports = router;