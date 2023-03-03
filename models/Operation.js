const mongoose = require('mongoose')
const Operation = mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    icon : {
        type : String,
        required : true
    },
    priority : {
        type : Number,
        required : true
    }

})

module.exports = mongoose.model('Operation',Operation);