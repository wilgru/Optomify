// const BookSetup = require('../models/BookSetup');

module.exports = {
    validateClinicalFileType: {
        validator: function (value) { return ["Prescription", "Clinical note", "Report"].includes(value) },
        message: props => `${props.value} File type invalid`
    },
    validateBookingStatus: {
        validator: function (value) { return ["Booked", "Confirmed", "Arrived", "Absent", "Cancelled"].includes(value) },
        message: "booking status invalid" 
    },
    validateBookingType: {
        validator: function (value) { return ["General eye test", "Health concern", "RMS form"].includes(value) },
        message: "booking type invalid" 
    },
    validate30MinBlock: {
        validator: function (value) { return value.getMinutes() % 30 === 0 },
        message: "not in a 30 min block"
    },
    validateBookSettedUp: {
        validator: async function (value) {
            const BookSetup = require('../models/BookSetup')
            const found = await BookSetup.exists({
                $and: [
                    { $expr: {$eq: [{$dayOfMonth: "$date"}, value.getDate()]} },
                    { $expr: {$eq: [{$month: "$date"}, value.getMonth() + 1]} },
                    { $expr: {$eq: [{$year: "$date"}, value.getFullYear()]} }
                ]
            })
        
            return found != null
        },
        message: "Cant book for a day that doesnt exist"
    },
    validateDioptres: {
        validator: function (value) { return value % 0.25 === 0 },
        message: "Value must be measured in dioptres (units of 0.25)"
    },
    validateCylinder: { 
        funnction(value) { return  value <= 0 },
        message: "Value must be a negative number"
    },
    validateAxisDegree: {
        validator: function(value) { return value >= 0 && value <= 180 },
        message: "Value must fall within 0 - 180 degrees"
    },
    validateEmail: {
        validator: function(value) {},
        message: ""
    },
    validateMobile: {
        validator: function(value) {},
        message: ""
    },
    validateMedicare: {
        validator: function(value) {},
        message: ""
    }
}