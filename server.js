const mongoose=require('mongoose');
const express=require('express');
const authRoutes =require('./routes/auth')
const PORT=3000;

const app=express();

mongoose.connect('mongodb://localhost:27017/CoutureCollection')
.then(()=> console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:',err));

app.use(express.json())

app.use('/api/auth',authRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT,()=>{
 console.log(`Server is running at ${PORT}`)
}
);