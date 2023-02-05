const mongoose = require('mongoose');

const product_schema = new mongoose.Schema({
    image : {
        type : Array,
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    newprice : {
        type : Number,
        required : true,
    },
    oldprice : {
        type : Number,
    },
    category : {
        type : String,
        required : true,
    },
    tags : {
        type : String,
        required : true,
    },
    status : {
        type : String,
        required : true,
    },
    cod : {
        type : String,
        required : true,
    },
    length : {
        type : Number,
    },
    width : {
        type : Number,
    },
    height : {
        type : Number,
    },
    extras : {
        type : String,
    }
});

const Product  = mongoose.model("Product_data" , product_schema);
module.exports = Product;