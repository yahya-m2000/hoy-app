/**
 * @jest-environment jsdom
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as chatService from '../src/services/chatService';
import * as mockChatService from '../src/services/mockChatService';
import axiosInstance from '../src/services/axiosConfig';

// Mock axios instance
jest.mock('../src/services/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      baseURL: '',
      headers: {
        common: {}
      }
    },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));

// Mock Constants from expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://test-api.example.com/api/v1'
      }
    }
  }
}));

// Mock network logger
jest.mock('../src/utils/networkLogger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock the mockChatService methods
jest.mock('../src/services/mockChatService', () => ({
  setCurrentUserId: jest.fn(),
  getConversations: jest.fn(() => Promise.resolve([{ id: 'mock-conversation' }])),
  getConversation: jest.fn(() => Promise.resolve({ id: 'mock-conversation' })),
  getChatMessages: jest.fn(() => Promise.resolve([{ id: 'mock-message' }])),
  createConversation: jest.fn(() => Promise.resolve({ id: 'new-mock-conversation' })),
  sendMessage: jest.fn(() => Promise.resolve({ id: 'new-mock-message' })),
  markMessagesAsRead: jest.fn(() => Promise.resolve(true)),
  getUnreadMessageCount: jest.fn(() => Promise.resolve(5)),
  getParticipantDetails: jest.fn(() => Promise.resolve([{ id: 'user1' }])),
  uploadAttachment: jest.fn(() => Promise.resolve({ url: 'mock-url' }))
}));

describe('Chat Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset fallback mode
    chatService.resetFallbackMode();
    
    // Mock token retrieval
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return Promise.resolve('mock-token');
      if (key === 'currentUserId') return Promise.resolve('mock-user-id');
      return Promise.resolve(null);
    });
  });
  
  describe('API endpoint calls', () => {
    test('getConversations should use the correct API endpoint', async () => {
      // Setup successful response
      axiosInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 'conversation1' }] }
      });
      
      // Call the service
      await chatService.getConversations();
      
      // Check the endpoint
      expect(axiosInstance.get).toHaveBeenCalledWith('/chat');
    });
    
    test('getConversation should use the correct API endpoint', async () => {
      // Setup successful response
      axiosInstance.get.mockResolvedValueOnce({
        data: { data: { id: 'conversation1' } }
      });
      
      // Call the service
      await chatService.getConversation('conversation1');
      
      // Check the endpoint
      expect(axiosInstance.get).toHaveBeenCalledWith('/chat/conversation1');
    });
    
    test('getChatMessages should use the correct API endpoint', async () => {
      // Setup successful response
      axiosInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 'message1' }] }
      });
      
      // Call the service
      await chatService.getChatMessages('chat1');
      
      // Check the endpoint
      expect(axiosInstance.get).toHaveBeenCalledWith('/chat/chat1/messages?limit=50');
    });
    
    test('sendMessage should use the correct API endpoint', async () => {
      // Setup successful response
      axiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 'message1' } }
      });
      
      // Call the service
      await chatService.sendMessage('chat1', 'Hello');
      
      // Check the endpoint
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/chat/chat1/messages',
        { text: 'Hello' }
      );
    });
    
    test('markMessagesAsRead should use the correct API endpoint', async () => {
      // Setup successful response
      axiosInstance.post.mockResolvedValueOnce({
        data: { success: true }
      });
      
      // Call the service
      await chatService.markMessagesAsRead('chat1');
      
      // Check the endpoint
      expect(axiosInstance.post).toHaveBeenCalledWith('/chat/chat1/read');
    });
    
    test('getUnreadMessageCount should use the correct API endpoint', async () => {
      // Setup successful response
      axiosInstance.get.mockResolvedValueOnce({
        data: { data: { count: 5 } }
      });
      
      // Call the service
      await chatService.getUnreadMessageCount();
      
      // Check the endpoint
      expect(axiosInstance.get).toHaveBeenCalledWith('/chat/unread/count');
    });
  });
  
  describe('Fallback mechanism', () => {
    test('should switch to fallback mode when endpoint returns 404', async () => {
      // Setup 404 response for first call
      axiosInstance.get.mockRejectedValueOnce({
        response: { status: 404 }
      });
      
      // Call the service
      await chatService.getConversations();
      
      // It should have called the mock service
      expect(mockChatService.getConversations).toHaveBeenCalled();
      
      // Setup mock for another method
      axiosInstance.post.mockRejectedValueOnce({
        response: { status: 404 }
      });
      
      // Call another service method
      await chatService.sendMessage('chat1', 'Hello');
      
      // It should use the mock directly without trying the API first
      expect(axiosInstance.post).not.toHaveBeenCalled();
      expect(mockChatService.sendMessage).toHaveBeenCalledWith('chat1', 'Hello', undefined);
    });
    
    test('should set current user ID in mock service when switching to fallback mode', async () => {
      // Setup 404 response
      axiosInstance.get.mockRejectedValueOnce({
        response: { status: 404 }
      });
      
      // Call the service
      await chatService.getConversations();
      
      // Check if current user ID was set
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('currentUserId');
      expect(mockChatService.setCurrentUserId).toHaveBeenCalledWith('mock-user-id');
    });
    
    test('should propagate non-404 errors', async () => {
      // Setup 500 response
      const error = {
        response: { status: 500, data: 'Server error' }
      };
      axiosInstance.get.mockRejectedValueOnce(error);
      
      // Call the service and expect it to reject
      await expect(chatService.getConversations()).rejects.toEqual(error);
      
      // Shouldn't have called the mock service
      expect(mockChatService.getConversations).not.toHaveBeenCalled();
    });
  });
  
  describe('Authentication', () => {
    test('should include authorization header with token', async () => {
      // Setup successful response
      axiosInstance.get.mockResolvedValueOnce({
        data: { data: [] }
      });
      
      // Call the service
      await chatService.getConversations();
      
      // Check if token was retrieved and used
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(axiosInstance.defaults.headers.common['Authorization']).toBe('Bearer mock-token');
    });
    
    test('should throw error when no token is available', async () => {
      // Mock no token
      AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
      
      // Call service and expect error
      await expect(chatService.getConversations()).rejects.toThrow('No authentication token available');
    });
  });
});
