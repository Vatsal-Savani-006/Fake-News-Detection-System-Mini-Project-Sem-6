const mongoose = require("mongoose");

async function connecttomongodb(url){
    return await mongoose.connect(url);
}

module.exports={
    connecttomongodb,
};