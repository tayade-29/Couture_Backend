const mongoose =require('mongoose');

const ProductSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    price:{
        type:Number,
        required:true,
        min:0       
    },
    quantity:{
        type:Number,
        required:true,
    },
    imageUrl:{
        type:String,
        required:true,
        trim:true,
    },
},{ timestamps: true }); 
    
module.exports=mongoose.model("Product",ProductSchema);