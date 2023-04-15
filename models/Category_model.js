const mongoose = require('mongoose');

const category_schema = new mongoose.Schema(
    {
        image : {
            type : String,
            required : true,
        },
        name : {
            type : String,
            required : true,
        },
    }
);

const Category  = mongoose.model("Category" , category_schema);
module.exports = Category;