const mongoose = require("mongoose");

try{
    mongoose.connect("mongodb://127.0.0.1:27017/RaftLab");
    console.log("Connected to database");
    
}
catch(error){
    console.log("Unable to connect to database");
    
}