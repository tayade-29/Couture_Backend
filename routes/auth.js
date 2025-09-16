const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=require('../models/User');
const axios = require('axios');
const bcrypt = require('bcrypt'); 


async function fetchIndiaLocation(pin){
    try{
        const res =await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
        const data=res.data;
        if(Array.isArray(data)&& data[0].Status==='Success' && data[0].PostOffice.length>0){
            const po= data[0].PostOffice[0];
            return{
                city:po.District || '',
                state:po.State || '',
                country:po.Country ||'',
            };
        }
    }
    catch(err){
        console.log(`Error occured while processing ${err}`);
    }
    return null;
}

router.post('/register',async (req, res) =>{
    try{
        const{name,phoneNo,email,zipcode,password}=req.body; 
    let city = '';
    let state = '';
    let country = '';
    if (/^[0-9]{6}$/.test(zipcode)) {
      const loc = await fetchIndiaLocation(zipcode);
      if (loc) {
        city = loc.city;
        state = loc.state;
        country = loc.country;
      }
    }  
    let userExist=await User.findOne({email}).exec();
    if(userExist) return res.status(400).send("Email is already used");
    const user = new User({
      name,
      phoneNo,
      email,
      zipcode,
      city,
      state,
      country,
      password,
    });
    await user.save();
    console.log("Saved user",user);
    return res.json({ok:true}); 
    }
    catch(err){
        console.log(err);
        return res.status(400).send("Error Try again")
    }
    
});
module.exports=router;