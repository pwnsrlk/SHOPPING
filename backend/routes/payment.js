const express = require('express');
const router = express.Router();

const {processPayment, sendStripApi} = require('../controllers/paymentController');

const {isAuthenticatedUser,autherizeRoles} = require('../middlewares/auth');

router.route('/payment/process').post(isAuthenticatedUser,processPayment);
router.route('/stripeapi').get(isAuthenticatedUser,sendStripApi);


module.exports = router; 