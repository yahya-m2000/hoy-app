# Upload Service

The Upload Service provides a comprehensive solution for handling file uploads in the mobile app with proper file organization and validation.

## Features

- **Profile Image Uploads**: Upload user profile pictures
- **Property Image Uploads**: Upload multiple property images
- **Unit Image Uploads**: Upload unit-specific images
- **File Organization**: Automatic organization by user and resource type
- **Image Validation**: Size, format, and dimension validation
- **Progress Tracking**: Real-time upload progress callbacks
- **Error Handling**: Comprehensive error handling and logging

## File Organization Structure

The service automatically organizes uploaded files in the following structure:

```
users/
└── {userId}/
    ├── profile/
    │   └── profile_timestamp_id.jpg
    ├── properties/
    │   └── {propertyId}/
    │       ├── main_image_timestamp_id.jpg
    │       ├── gallery_image_timestamp_id.jpg
    │       └── units/
    │           └── {unitId}/
    │               ├── unit_image_timestamp_id.jpg
    │               └── unit_photo_timestamp_id.jpg
    └── reviews/
        └── {reviewId}/
            └── review_image_timestamp_id.jpg
```

## Usage Examples

### 1. Profile Image Upload

```typescript
import { UploadService } from '@core/api/services';
import * as ImagePicker from 'expo-image-picker';

const uploadProfileImage = async () => {
  try {
    // Pick image from gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const image = result.assets[0];
      
      // Upload with progress tracking
      const uploadResult = await UploadService.uploadProfileImage(
        image.uri,
        image.type,
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
          // Update UI with progress
        }
      );

      console.log('Profile image uploaded:', uploadResult.data.imageUrl);
      return uploadResult.data.imageUrl;
    }
  } catch (error) {
    console.error('Profile image upload failed:', error);
    throw error;
  }
};
```

### 2. Property Images Upload

```typescript
import { UploadService } from '@core/api/services';
import * as ImagePicker from 'expo-image-picker';

const uploadPropertyImages = async (propertyId: string) => {
  try {
    // Pick multiple images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const images = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type,
        name: `property_image_${index + 1}.jpg`,
      }));

      // Upload all images
      const uploadResult = await UploadService.uploadPropertyImages(
        propertyId,
        images,
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      );

      console.log(`${uploadResult.data.uploadedCount} images uploaded`);
      return uploadResult.data.images;
    }
  } catch (error) {
    console.error('Property images upload failed:', error);
    throw error;
  }
};
```

### 3. Unit Images Upload

```typescript
import { UploadService } from '@core/api/services';

const uploadUnitImages = async (unitId: string, imageUris: string[]) => {
  try {
    const images = imageUris.map((uri, index) => ({
      uri,
      type: 'image/jpeg',
      name: `unit_image_${index + 1}.jpg`,
    }));

    const uploadResult = await UploadService.uploadUnitImages(
      unitId,
      images,
      (progress) => {
        console.log(`Unit images upload progress: ${progress}%`);
      }
    );

    return uploadResult.data.images;
  } catch (error) {
    console.error('Unit images upload failed:', error);
    throw error;
  }
};
```

### 4. Image Deletion

```typescript
import { UploadService } from '@core/api/services';

const deleteImage = async (fileName: string, fileId: string, resourceType: 'profile' | 'property' | 'unit', resourceId?: string) => {
  try {
    const deleted = await UploadService.deleteImage(fileName, fileId, resourceType, resourceId);
    console.log('Image deleted successfully');
    return deleted;
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw error;
  }
};
```

### 5. Image Validation

```typescript
import { UploadService } from '@core/api/services';

const validateImage = async (imageUri: string) => {
  try {
    const isValid = await UploadService.validateImage(
      { uri: imageUri, type: 'image/jpeg' },
      {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['image/jpeg', 'image/png'],
        maxWidth: 2048,
        maxHeight: 2048,
      }
    );
    
    console.log('Image is valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Image validation failed:', error);
    throw error;
  }
};
```

## React Hook Example

Here's a custom hook that integrates the upload service with React state:

```typescript
import { useState, useCallback } from 'react';
import { UploadService } from '@core/api/services';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadProfileImage = useCallback(async (imageUri: string, imageType?: string) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await UploadService.uploadProfileImage(
        imageUri,
        imageType,
        (progress) => setUploadProgress(progress)
      );
      
      setIsUploading(false);
      return result.data.imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      throw err;
    }
  }, []);

  const uploadPropertyImages = useCallback(async (
    propertyId: string,
    images: Array<{ uri: string; type?: string; name?: string }>
  ) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await UploadService.uploadPropertyImages(
        propertyId,
        images,
        (progress) => setUploadProgress(progress)
      );
      
      setIsUploading(false);
      return result.data.images;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      throw err;
    }
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadProfileImage,
    uploadPropertyImages,
  };
};
```

## Error Handling

The service provides comprehensive error handling:

```typescript
try {
  await UploadService.uploadProfileImage(imageUri);
} catch (error) {
  if (error.message.includes('size must be less than')) {
    // Handle file size error
  } else if (error.message.includes('Unsupported image format')) {
    // Handle format error
  } else {
    // Handle general upload error
  }
}
```

## Migration from Old Property Service

If you're migrating from the old `PropertyManagementService.uploadPropertyImages`:

```typescript
// Old way (deprecated)
import { PropertyManagementService } from '@core/api/services';
const formData = new FormData();
// ... add images to formData
const urls = await PropertyManagementService.uploadPropertyImages(propertyId, formData);

// New way (recommended)
import { UploadService } from '@core/api/services';
const images = [{ uri: imageUri, type: 'image/jpeg', name: 'image.jpg' }];
const result = await UploadService.uploadPropertyImages(propertyId, images);
const urls = result.data.images.map(img => img.imageUrl);
```

## Benefits of the New Service

1. **Better File Organization**: Files are organized by user and resource type
2. **Improved Validation**: Comprehensive image validation before upload
3. **Progress Tracking**: Real-time upload progress callbacks
4. **Type Safety**: Full TypeScript support with proper types
5. **Error Handling**: Better error messages and handling
6. **Consistency**: Unified interface for all upload operations 