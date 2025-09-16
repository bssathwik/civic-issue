const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Process and save image
const processImage = async (buffer, filename, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toBuffer();

    // Save processed image
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, processedBuffer);

    return {
      filename,
      path: filepath,
      size: processedBuffer.length,
      url: `/uploads/${filename}`
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

// Middleware to handle single image upload
const uploadSingle = (fieldName) => {
  return async (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (req.file) {
        try {
          const timestamp = Date.now();
          const filename = `${fieldName}-${timestamp}-${Math.round(Math.random() * 1E9)}.jpg`;
          
          const processedImage = await processImage(req.file.buffer, filename);
          req.uploadedFile = processedImage;
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: error.message
          });
        }
      }

      next();
    });
  };
};

// Middleware to handle multiple image uploads
const uploadMultiple = (fieldName, maxCount = 5) => {
  return async (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (req.files && req.files.length > 0) {
        try {
          const processedImages = [];
          
          for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const timestamp = Date.now();
            const filename = `${fieldName}-${timestamp}-${i}-${Math.round(Math.random() * 1E9)}.jpg`;
            
            const processedImage = await processImage(file.buffer, filename);
            processedImages.push(processedImage);
          }
          
          req.uploadedFiles = processedImages;
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: error.message
          });
        }
      }

      next();
    });
  };
};

// Utility function to delete file
const deleteFile = async (filename) => {
  try {
    const filepath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', filename);
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  processImage,
  deleteFile
};