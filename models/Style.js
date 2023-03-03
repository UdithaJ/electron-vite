const mongoose = require('mongoose')
const Style = mongoose.Schema({

    styleNo : {
        type : String,
        required : true
    },
    styleName : {
        type : String,
        required : true
    },
    operations : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'OperationGroup'
    },

})

module.exports = mongoose.model('Style',Style);