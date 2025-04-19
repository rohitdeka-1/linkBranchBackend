import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath:string):Promise<any> => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      allowed_formats: ['jpg', 'png', 'jpeg'],
      folder: "linkBRANCH",
    });

    fs.unlinkSync(localFilePath) 
    return response;


  } catch (error) {

    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      } // remove the locally saved temp file as upload was failed.
    console.log(error);
    return null;
  }
};


// rohit rohitdekarhd rhd@gmail.com
// File Uploaded... http://res.cloudinary.com/doejdsmym/image/upload/v1744126817/ye8iuwva8dfqd32bvi2s.png
// File Uploaded... http://res.cloudinary.com/doejdsmym/image/upload/v1744126818/lzhtuadnpkziarzjl1k0.png


export { uploadOnCloudinary };


