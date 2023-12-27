const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../Models/Listing.js");

// connecting to database

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const initDB = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "6587a6d20fcb3e7dd5f5a2ef",
  }));
  await Listing.insertMany(initdata.data);
  console.log("Data was initilized");
};

initDB();
