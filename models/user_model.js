const mongoose = require('mongoose');

const user_schema = new mongoose.Schema(
    {
        image : {
            type : String,
            required : true,
        },
        full_name : {
            type : String,
            required : true,
        },
        email : {
            type : String,
            required : true,
        },
        password : {
            type : String,
            required : true,
        },
        mobile_no : {
            type : Number,
            required : true,
        },
        gender : {
            type : String,
            required : true,
        },
        age : {
            type : Number,
            required : true,
        },
        dob : {
            type : String,
            required : true,
        },
        address : {
            house_no : {
                type : String,
            },
            street : {
                type : String,
            },
            area : {
                type : String,
            },
            city : {
                type : String,
            },
            state : {
                type : String,
            },
            pin_code : {
                type : String,
            },
        },
        wishlist : {
            type : Array,
        },
        on_cart : {
            type : Array,
        },
        orders : {
            type : Array,
        },
        workshops : {
            type : Array,
        },
    }
);

const User  = mongoose.model("User_data" , user_schema);
module.exports = User;
