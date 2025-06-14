import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';

// Cloudinary configuration
cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.IMAGE_API_KEY,
    api_secret: config.IMAGE_API_SECRET,
});

// Upload a single image to Cloudinary
const uploadOnCloudinary = async (base64String, folderName) => {
    try {
        if (!base64String) return null;

        const prefixedBase64String = base64String.startsWith('data:')
            ? base64String
            : `data:image/jpeg;base64,${base64String}`;

        const response = await cloudinary.uploader.upload(prefixedBase64String, {
            resource_type: 'image',
            folder: folderName,
        });

        return response;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return null;
    }
};

// Upload multiple images to Cloudinary
const uploadArrayImage = async (images, folderName) => {
    try {
        if (!images || !Array.isArray(images)) return null;

        const uploadPromises = images.map(async (imageObj) => {
            const base64String = imageObj.img;

            if (typeof base64String !== 'string') {
                // console.error('Invalid base64String for imageObj:', imageObj);
                return {
                    ...imageObj,
                    error: 'Invalid base64String'
                };
            }

            const prefixedBase64String = base64String.startsWith('data:')
                ? base64String
                : `data:image/jpeg;base64,${base64String}`;

            try {
                const response = await cloudinary.uploader.upload(prefixedBase64String, {
                    resource_type: 'image',
                    folder: folderName,
                });
                return {
                    ...imageObj,
                    cloudinaryResponse: response
                };
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                return {
                    ...imageObj,
                    error: error.message
                };
            }
        });

        const uploadResults = await Promise.all(uploadPromises);
        return uploadResults;
    } catch (error) {
        console.error('Error in uploadOnCloudinary:', error);
        return null;
    }
};

export { uploadOnCloudinary, uploadArrayImage };

// if (Array.isArray(reqData.vehiclePictures)) {
//     let promises = [];

//     for (let obj of reqData.vehiclePictures) {
//         let imageLocation;

//         // Check if the image is already a URL
//         if (obj.img.startsWith("https://") || obj.img.startsWith("http://")) {
//             imageLocation = obj.img; // Keep the existing URL
//             promises.push({ img: imageLocation }); // Add to promises array
//         } else {
//             // Upload the base64 images and handle the response
//             const uploadedImages = await upload.uploadArrayImage(
//                 reqData.vehiclePictures,
//                 "vehiclePictures"
//             );

//             // Map over uploadedImages array to extract the secure_url
//             const formattedPictures = uploadedImages
//                 .map((uploadedImage) => {
//                     const secureUrl = uploadedImage?.cloudinaryResponse?.secure_url;
//                     return secureUrl ? { img: secureUrl } : null; // Ensure valid URLs
//                 })
//                 .filter((item) => item !== null); // Remove null values

//             promises = promises.concat(formattedPictures); // Append formatted pictures
//             break; // Exit loop after processing array
//         }
//     }

//     // Update the vehiclePictures field in updateData
//     updateData.vehiclePictures = promises;
// }