const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configure Cloudinary if credentials provided
if (
  config.storage.provider === 'cloudinary' &&
  config.storage.cloudinary.cloudName &&
  config.storage.cloudinary.apiKey
) {
  cloudinary.config({
    cloud_name: config.storage.cloudinary.cloudName,
    api_key: config.storage.cloudinary.apiKey,
    api_secret: config.storage.cloudinary.apiSecret,
  });
}

class StorageService {
  async uploadFile(file, folder = 'viral-catalogs') {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Cloudinary provider
    if (
      config.storage.provider === 'cloudinary' &&
      config.storage.cloudinary.cloudName &&
      config.storage.cloudinary.apiKey
    ) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image',
      });

      // Cleanup local temp file if multer wrote to disk
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // Persist a root-relative path so the same DB value works in every environment.
    // The client prefixes the API origin when rendering (`resolveMediaUrl`).
    const filename = path.basename(file.path);
    const fileUrl = `/uploads/${filename}`;

    return {
      url: fileUrl,
      public_id: filename,
    };
  }

  async deleteFile(publicId) {
    if (!publicId) return;

    if (
      config.storage.provider === 'cloudinary' &&
      config.storage.cloudinary.cloudName
    ) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting file from Cloudinary:', err);
      }
      return;
    }

    // Local cleanup
    try {
      const localPath = path.resolve('public', 'uploads', publicId);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.error('Error deleting local file:', err);
    }
  }
}

module.exports = new StorageService();
