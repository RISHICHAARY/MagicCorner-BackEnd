const mongoose = require('mongoose');

const review_schema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
        },
        loc : {
            type : String,
            required : true,
        },
        rev : {
            type : String,
            required : true,
        },
        rating : {
            type : Number,
            required : true,
        },
    }
);

const Review  = mongoose.model("Review" , review_schema);
module.exports = Review;