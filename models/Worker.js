const mongoose = require('mongoose')
const Worker = mongoose.Schema({

    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    skills : [{
        type : mongoose.Schema.Types.ObjectId,
        required : true
    }],
    avatar : {
        type : String,
        required : true
    }

})

module.exports = mongoose.model('Worker',Worker);