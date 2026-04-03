import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const configureCloudinary = (config: { cloud_name?: string; api_key?: string; api_secret?: string }) => {
  const cloud_name = config.cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = config.api_key || process.env.CLOUDINARY_API_KEY;
  const api_secret = config.api_secret || process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret
    });
    console.log('Cloudinary configured (using DB settings or fallback to .env)');
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "katiani-styles",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
});

export const upload = multer({ storage });
export default cloudinary;
