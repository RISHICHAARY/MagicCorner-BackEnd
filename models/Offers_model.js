const mongoose = require('mongoose');

const offer_schema = new mongoose.Schema({
    name : {
        type : String,
    },
    min_price : {
        type : Number,
    },
    discount : {
        type : String,
    },
    method : {
        type : String,
    },
});

const Offers = mongoose.model("Offers" , offer_schema);
module.exports = Offers;