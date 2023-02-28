const mongoose = require('mongoose');

const workshop_schema = new mongoose.Schema({
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
    watsapp_grp : {
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
});

const Workshop  = mongoose.model("Workshop_data" , workshop_schema);
module.exports = Workshop;
