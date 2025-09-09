import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // force load from root

console.log("Cloudinary URL:", process.env.CLOUDINARY_URL);
console.log("Mpesa Key:", process.env.MPESA_CONSUMER_KEY);
