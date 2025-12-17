/**
 * Test Cloudinary Configuration
 */

import { CloudinaryService } from '../services/cloudinaryService';

export const testCloudinaryConfig = async () => {
  
  // Test basic config validation
  const isConfigValid = CloudinaryService.validateConfig();
  
  // Test connection
  const connectionTest = await CloudinaryService.testConnection();
  
  return { isConfigValid, connectionTest };
};