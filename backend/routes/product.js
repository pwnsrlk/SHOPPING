const express = require('express');
const router = express.Router();


const{ 
    getProducts, 
    newProduct, 
    getSingleProduct,
    UpdateProduct, 
    deleteProduct,
    getAdminProducts,
    createProductReview,
    getProductReviews,
    deleteReview } =require('../controllers/productController')
const {isAuthenticatedUser,autherizeRoles } = require('../middlewares/auth')

router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);
router.route('/admin/products').get(getAdminProducts);
router.route('/admin/product/new').post(isAuthenticatedUser,autherizeRoles('admin'),newProduct);
router.route('/admin/product/:id')
     .put(isAuthenticatedUser,autherizeRoles('admin'),UpdateProduct)
     .delete(isAuthenticatedUser,autherizeRoles('admin'),deleteProduct);

router.route('/review').put(isAuthenticatedUser,createProductReview);
router.route('/reviews').get(isAuthenticatedUser,getProductReviews);
router.route('/reviews').delete(isAuthenticatedUser,deleteReview)

module.exports =router;