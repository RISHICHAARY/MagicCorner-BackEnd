const mongoose = require('mongoose');

const enrollment_schema = new mongoose.Schema({
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
    wn : {
        type : String,
        required : true,
    },
    total : {
        type : String,
        required : true,
    },
});

const Enrollments = mongoose.model("Enrollments_data" , enrollment_schema);
module.exports = Enrollments;