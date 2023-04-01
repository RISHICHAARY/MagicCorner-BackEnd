const mongoose = require('mongoose');

const contact_query = new mongoose.Schema({
    question : {
        type : String,
    },
    posted_by : {
        type : String,
    },
    answer : {
        type : String,
    },
    answered_by : {
        type : String,
    }
});

const Question = mongoose.model("Contact" , contact_query);
module.exports = Question;