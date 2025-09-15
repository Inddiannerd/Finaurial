const express = require('express');
const router = express.Router();
const { getUsers, suspendUser, getFeatureFlags, addFeatureFlag, updateFeatureFlag, deleteFeatureFlag } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// User routes
router.get('/users', [auth, admin], getUsers);
router.put('/users/:id/suspend', [auth, admin], suspendUser);

// Feature Flag routes
router.route('/features')
    .get(auth, getFeatureFlags) // No admin middleware to allow all logged-in users to see flags
    .post([auth, admin], addFeatureFlag);

router.route('/features/:id')
    .put([auth, admin], updateFeatureFlag)
    .delete([auth, admin], deleteFeatureFlag);

module.exports = router;