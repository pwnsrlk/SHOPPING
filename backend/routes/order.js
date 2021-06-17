const express = require('express');
const router = express.Router();

const { newOrder,getSingleOrder,myOrders,allOrders,updateOrder,deleteOrder} = require('../controllers/orderController');

const {isAuthenticatedUser,autherizeRoles} = require('../middlewares/auth');

router.route('/order/new').post(isAuthenticatedUser,newOrder);

router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser,myOrders);
router.route('/admin/orders').get(isAuthenticatedUser,autherizeRoles('admin'),allOrders);
router.route('/admin/order/:id')
                .put(isAuthenticatedUser,autherizeRoles('admin'),updateOrder)
                .delete(isAuthenticatedUser,autherizeRoles('admin'),deleteOrder)
module.exports = router; 