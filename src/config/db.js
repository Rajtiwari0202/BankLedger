const mongoose = require("mongoose")

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Database Connected Successfully");
    })
    .catch(err=>{
        console.log("Error Connecting to DB");
        process.exit(1);
    })
}
module.exports = connectToDB;