/**
 * Test Cloudinary Configuration
 */

import { CloudinaryService } from '../services/cloudinaryService';

export const testCloudinaryConfig = async () => {
  console.log('🧪 Testing Cloudinary configuration...');
  
  // Test basic config validation
  const isConfigValid = CloudinaryService.validateConfig();
  console.log('Config valid:', isConfigValid);
  
  // Test connection
  const connectionTest = await CloudinaryService.testConnection();
  console.log('Connection test result:', connectionTest);
  
  return { isConfigValid, connectionTest };
};