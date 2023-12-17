import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async localFilePath => {
  try {
        // Check if file exists else throw error
    if (!localFilePath) throw new Error("No file path provided");
    // Upload file on cloudinary
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded
    fs.unlinkSync(localFilePath);
    // console.log("File is upload on:", await res.url);
    return res;
  } catch (err) {
    // remove locally saved file as the upload failed
    console.error("upload to cloudinary failed", err);
  }
};

export default uploadOnCloudinary;
