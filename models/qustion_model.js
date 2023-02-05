const mongoose = require('mongoose');

const question_schema = new mongoose.Schema({
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

const Question = mongoose.model("Queries" , question_schema);
module.exports = Question;