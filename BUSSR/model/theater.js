
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const theater_schema = new mongoose.Schema({

    createdOn: {
        type: Date,
        default: new Date(Date.now())
    },
    customer_name: {
        type: String,
        required: true
    },
    performance_title: {
        type: String,
        required: true
    },
    performance_time: {
        type: Date,
        required: true
    },
    ticket_price: {
        type: Number,
        required: true
    },
});


const Theater = mongoose.model('Theater', theater_schema,"theater_info");
module.exports = Theater;