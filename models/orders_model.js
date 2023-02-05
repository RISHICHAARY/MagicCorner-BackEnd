const mongoose = require('mongoose');

const order_schema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    mobile : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    products : {
        type : Array,
        required : true,
    },
    payment_mode : {
        type : String,
        required : true,
    },
    status : {
        type : String,
        required : true,
    },
    stotal : {
        type : String,
        required : true,
    },
    total : {
        type : String,
        required : true,
    },
    discount : {
        type : String,
        required : true,
    },
    address : {
        type : String,
        required : true,
    },
});

const Orders = mongoose.model("Orders_data" , order_schema);
module.exports = Orders;