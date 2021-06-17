const Product = require('../models/products');
const dotenv = require ('dotenv');
const connectDatabase = require ('../config/database');

const products = require ('../data/products');


// setting dotenv file
dotenv.config({ path: 'backend/config/config.env' })

connectDatabase();

const seedProducts = async () => {
    try {

        await Product.deleteMany();
        console.log('products are deleted');

        await Product.insertMany(products)
        console.log('all products are added')

        process.exit();

    } catch (error) {
        console.log(error.message);
        process.exit()
    }
}

seedProducts()