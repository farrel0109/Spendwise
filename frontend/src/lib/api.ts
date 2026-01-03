/**
 * @deprecated Import from '@/lib/api' instead for better tree-shaking
 * This file is kept for backward compatibility
 */

// Re-export everything from the new modular API structure
export * from './api/index';

// Default export for compatibility
import { apiClient } from './api/client';
export default apiClient;
