/**
 * Upload Service
 * 
 * Comprehensive service for file uploads including:
 * - Profile image uploads
 * - Property image uploads
 * - Unit image uploads
 * - File organization by user and resource type
 * - Image validation and optimization
 * 
 * @module @core/api/services/upload
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { api } from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import { logger } from "@core/utils/sys/log";

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Upload response structure
 */
export interface UploadResponse {
  success: boolean;
  data: {
    imageUrl: string;
    fileName: string;
  };
}

/**
 * Multiple upload response structure
 */
export interface MultipleUploadResponse {
  success: boolean;
  data: {
    uploadedCount: number;
    images: Array<{
      imageUrl: string;
      fileName: string;
    }>;
  };
}

/**
 * Image validation options
 */
export interface ImageValidationOptions {
  maxSizeBytes?: number;
  allowedFormats?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

// ========================================
// UPLOAD SERVICE
// ========================================

/**
 * Upload service class for handling file uploads
 */
export class UploadService {
  private static readonly DEFAULT_VALIDATION: ImageValidationOptions = {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 4096,
    maxHeight: 4096,
  };

  /**
   * Validate image file before upload
   * 
   * @param file - File object or URI info
   * @param options - Validation options
   * @returns Promise<boolean> - True if valid
   * @throws Error if validation fails
   */
  static async validateImage(
    file: { uri: string; type?: string; fileSize?: number },
    options: ImageValidationOptions = {}
  ): Promise<boolean> {
    const validation = { ...this.DEFAULT_VALIDATION, ...options };

    try {
      // Check file type
      if (file.type && validation.allowedFormats) {
        if (!validation.allowedFormats.includes(file.type)) {
          throw new Error(`Unsupported image format. Allowed formats: ${validation.allowedFormats.join(', ')}`);
        }
      }

      // Check file size
      if (file.fileSize && validation.maxSizeBytes) {
        if (file.fileSize > validation.maxSizeBytes) {
          const maxMB = validation.maxSizeBytes / (1024 * 1024);
          throw new Error(`Image size must be less than ${maxMB}MB`);
        }
      }

      return true;
    } catch (error: any) {
      logErrorWithContext("UploadService.validateImage", error);
      throw error;
    }
  }

  /**
   * Create FormData for image upload
   * 
   * @param images - Array of image objects
   * @param fieldName - Form field name (default: 'images')
   * @returns FormData - Ready for upload
   */
  static createImageFormData(
    images: Array<{ uri: string; type?: string; name?: string }>,
    fieldName: string = 'images'
  ): FormData {
    const formData = new FormData();

    images.forEach((image, index) => {
      const imageFile = {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name || `image_${index + 1}.jpg`,
      } as any;

      if (fieldName === 'image') {
        // Single image upload (profile)
        formData.append('image', imageFile);
      } else {
        // Multiple images upload
        formData.append(fieldName, imageFile);
      }
    });

    return formData;
  }

  /**
   * Upload profile image
   * 
   * @param imageUri - Local image URI or remote URL
   * @param imageType - Image MIME type
   * @param onProgress - Progress callback
   * @returns Promise<UploadResponse> - Upload result
   */
  static async uploadProfileImage(
    imageUri: string,
    imageType?: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    try {
      logger.log("Starting profile image upload");

      // Check if it's a remote URL (from SSO)
      const isRemoteUrl = imageUri.startsWith('http://') || imageUri.startsWith('https://');
      
      if (isRemoteUrl) {
        // For remote URLs (SSO profile pictures), use the backend to download and upload
        logger.log("Uploading remote profile image from SSO");
        
        const response = await api.post<UploadResponse>("/upload/profile-image-url", {
          imageUrl: imageUri,
        });

        logger.log("Remote profile image upload successful", {
          fileName: response.data.data.fileName,
          imageUrl: response.data.data.imageUrl,
        });

        return response.data;
      } else {
        // Local image upload
        // Validate image
        await this.validateImage({
          uri: imageUri,
          type: imageType,
        }, {
          maxSizeBytes: 5 * 1024 * 1024, // 5MB for profile images
        });

        // Create form data
        const formData = this.createImageFormData([{
          uri: imageUri,
          type: imageType || 'image/jpeg',
          name: 'profile.jpg',
        }], 'image');

        // Upload with progress tracking
        const response = await api.post<UploadResponse>(
          "/upload/profile-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent: any) => {
              if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
              }
            },
          } as any
        );

        logger.log("Local profile image upload successful", {
          fileName: response.data.data.fileName,
          imageUrl: response.data.data.imageUrl,
        });

        return response.data;
      }
    } catch (error: any) {
      logErrorWithContext("UploadService.uploadProfileImage", error);
      throw new Error(error.response?.data?.error || "Failed to upload profile image");
    }
  }

  /**
   * Upload property images
   * 
   * @param propertyId - Property ID
   * @param images - Array of image URIs and metadata
   * @param onProgress - Progress callback
   * @returns Promise<MultipleUploadResponse> - Upload result
   */
  static async uploadPropertyImages(
    propertyId: string,
    images: Array<{ uri: string; type?: string; name?: string }>,
    onProgress?: UploadProgressCallback
  ): Promise<MultipleUploadResponse> {
    try {
      logger.log("Starting property images upload", {
        propertyId,
        imageCount: images.length,
      });

      if (!propertyId) {
        throw new Error("Property ID is required");
      }

      if (!images || images.length === 0) {
        throw new Error("At least one image is required");
      }

      // Validate all images
      for (const image of images) {
        await this.validateImage(image);
      }

      // Create form data
      const formData = this.createImageFormData(images, 'images');

      // Upload with progress tracking
      const response = await api.post<MultipleUploadResponse>(
        `/upload/property-images/${propertyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: any) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        } as any
      );

      logger.log("Property images upload successful", {
        propertyId,
        uploadedCount: response.data.data.uploadedCount,
      });

      return response.data;
    } catch (error: any) {
      logErrorWithContext("UploadService.uploadPropertyImages", error);
      throw new Error(error.response?.data?.error || "Failed to upload property images");
    }
  }

  /**
   * Upload unit images
   * 
   * @param unitId - Unit ID
   * @param images - Array of image URIs and metadata
   * @param onProgress - Progress callback
   * @returns Promise<MultipleUploadResponse> - Upload result
   */
  static async uploadUnitImages(
    unitId: string,
    images: Array<{ uri: string; type?: string; name?: string }>,
    onProgress?: UploadProgressCallback
  ): Promise<MultipleUploadResponse> {
    try {
      logger.log("Starting unit images upload", {
        unitId,
        imageCount: images.length,
      });

      if (!unitId) {
        throw new Error("Unit ID is required");
      }

      if (!images || images.length === 0) {
        throw new Error("At least one image is required");
      }

      // Validate all images
      for (const image of images) {
        await this.validateImage(image);
      }

      // Create form data
      const formData = this.createImageFormData(images, 'images');

      // Upload with progress tracking
      const response = await api.post<MultipleUploadResponse>(
        `/upload/unit-images/${unitId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: any) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        } as any
      );

      logger.log("Unit images upload successful", {
        unitId,
        uploadedCount: response.data.data.uploadedCount,
      });

      return response.data;
    } catch (error: any) {
      logErrorWithContext("UploadService.uploadUnitImages", error);
      throw new Error(error.response?.data?.error || "Failed to upload unit images");
    }
  }

  /**
   * Delete an uploaded image
   * 
   * @param fileName - File name to delete
   * @param fileId - File ID from upload response
   * @param resourceType - Type of resource (profile, property, unit)
   * @param resourceId - Resource ID (property/unit ID)
   * @returns Promise<boolean> - True if deleted successfully
   */
  static async deleteImage(
    fileName: string,
    fileId: string,
    resourceType: 'profile' | 'property' | 'unit',
    resourceId?: string
  ): Promise<boolean> {
    try {
      logger.log("Deleting image", {
        fileName,
        fileId,
        resourceType,
        resourceId,
      });

      await api.request({
        method: 'DELETE',
        url: "/upload/delete-image",
        data: {
          fileName,
          fileId,
          resourceType,
          resourceId,
        },
      });

      logger.log("Image deleted successfully", { fileName });
      return true;
    } catch (error: any) {
      logErrorWithContext("UploadService.deleteImage", error);
      throw new Error(error.response?.data?.error || "Failed to delete image");
    }
  }

  /**
   * Get temporary download URL for a private file
   * 
   * @param fileName - File name to get download URL for
   * @returns Promise<string> - Temporary download URL
   */
  static async getDownloadUrl(fileName: string): Promise<string> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          downloadUrl: string;
          expiresIn: number;
        };
      }>(`/upload/download-url/${encodeURIComponent(fileName)}`);

      return response.data.data.downloadUrl;
    } catch (error: any) {
      logErrorWithContext("UploadService.getDownloadUrl", error);
      throw new Error(error.response?.data?.error || "Failed to get download URL");
    }
  }
}

// ========================================
// LEGACY EXPORTS
// ========================================

export const uploadProfileImage = UploadService.uploadProfileImage;
export const uploadPropertyImages = UploadService.uploadPropertyImages;
export const uploadUnitImages = UploadService.uploadUnitImages;
export const deleteImage = UploadService.deleteImage;
export const getDownloadUrl = UploadService.getDownloadUrl;

export default UploadService; 