const mongoose = require('mongoose')
const OperationGroup = mongoose.Schema({

    styleId: {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'Style'
    },
    operations : [{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'Operation'
    }],
    group: {
        type: Number,
        required : true
    }

})

module.exports = mongoose.model('OperationGroup',OperationGroup);