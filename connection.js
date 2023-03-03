const mongoose = require("mongoose");
require('dotenv/config')

mongoose.connect(
    process.env.DB_CONNECTION,
    {useNewUrlParser: true , useUnifiedTopology:true},
)

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("database connected")
})
