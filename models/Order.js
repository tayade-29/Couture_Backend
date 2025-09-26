const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    product:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    message:{
        type:String
    },
    deliveryAddress:{
        type:String,
        required:true
    },

        timestamps:true

    });

    module.exports=mongoose.model("Order",OrderSchema)