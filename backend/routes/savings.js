const express = require('express');
const router = express.Router();
const { getSavings, addSaving, getSavingsSummary } = require('../controllers/savingsController');
const auth = require('../middleware/auth');

router.route('/').get(auth, getSavings).post(auth, addSaving);
router.route('/summary').get(auth, getSavingsSummary);

module.exports = router;