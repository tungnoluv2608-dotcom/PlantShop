const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = "plantweb";
const TRANSFORM = { width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" };

function uploadStream(fileStream, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: FOLDER, ...TRANSFORM, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    fileStream.pipe(uploadStream);
  });
}

function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: FOLDER, ...TRANSFORM, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadStream, uploadBuffer };
