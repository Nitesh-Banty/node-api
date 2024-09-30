
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}


// import { v2 as cloudinary } from 'cloudinary';
// import { promises as fs } from 'fs';
// import { CloudinaryResponse } from './types'; // You'll need to define this type

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /**
//  * Uploads a file to Cloudinary and returns the response.
//  * @param localFilePath - The path to the local file to upload.
//  * @returns A Promise that resolves to the Cloudinary response or null if upload fails.
//  */
// export const uploadToCloudinary = async (localFilePath: string): Promise<CloudinaryResponse | null> => {
//   try {
//     if (!localFilePath) {
//       throw new Error('No file path provided');
//     }

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: 'auto',
//     });

//     // File uploaded successfully
//     console.log('File uploaded to Cloudinary:', response.url);

//     return response;
//   } catch (error) {
//     console.error('Error uploading file to Cloudinary:', error);
//     return null;
//   } finally {
//     // Always attempt to remove the local file, regardless of upload success
//     try {
//       await fs.unlink(localFilePath);
//     } catch (unlinkError) {
//       console.warn('Failed to remove local file:', unlinkError);
//     }
//   }
};
