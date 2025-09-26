const mongoose =require('mongoose');

const UserSchema =new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    phoneNo:{
        type:String,
        required:true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    email:{
        type:String,
        required:true,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
    },
    isAdmin: { type: Boolean, default: false },
    zipcode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit ZIP code']
    } ,
    city:{
        type:String
    },
    State:{
        type:String
    },
    Country:{
        type:String
    },
    password:{
        type:String,
        
    }

});

 module.exports=mongoose.model('User',UserSchema);