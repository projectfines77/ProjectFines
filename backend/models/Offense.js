const mongoose = require('mongoose')

const OffenseSchema = new mongoose.Schema({
    policeThatIssuedOffenseID: {
        type: mongoose.Types.ObjectId,
        ref: 'Police',
        required: true,
    },
    imageEvidence: {
        type:[String],
    },
    offenseType:{
        type:String,
        enum:['drunkDriving', 'speeding'],
        default:'Not stated'
    },
    policeThatIssuedOffenseBadgenumber: {
        type: String,
        required: true,
    },
    carPlate:{
        type: String,
        required: true,
    },
    resolvedOrNot:{
        type:String,
        enum:['false', 'true', 'processing', 'invalidated', 'late'],
        default:'false'
    },
    resolvedDateTime:{
        type: Date
    },
})

module.exports = mongoose.model('Offense', OffenseSchema);