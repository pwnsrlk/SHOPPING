const express = require('express');
const router =  express.Router();

const {registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateUserProfile,
    logout,
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser} = require('../controllers/authController');

const {isAuthenticatedUser,autherizeRoles} = require('../middlewares/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logout);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser,updateUserProfile);
router.route('/admin/users').get(isAuthenticatedUser,autherizeRoles('admin'),allUsers);
router.route('/admin/user/:id')
        .get(isAuthenticatedUser,autherizeRoles('admin'),getUserDetails)
        .put(isAuthenticatedUser,autherizeRoles('admin'),updateUser)
        .delete(isAuthenticatedUser,autherizeRoles('admin'),deleteUser)

module.exports = router; 