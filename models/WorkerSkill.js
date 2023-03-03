const mongoose = require('mongoose')
const WorkerSkill = mongoose.Schema({

    workerId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'Worker'
    },
    skillId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'Operation'
    },
    level: {
        type: Number,
        required : true
    }

})

module.exports = mongoose.model('WorkerSkill',WorkerSkill);