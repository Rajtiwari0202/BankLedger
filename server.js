const app = require("./src/app");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./src/config/db");
const PORT = process.env.PORT || 3000;
connectToDB();
app.listen(3000,()=>{
    console.log(`Server is running on port ${PORT}`);
})