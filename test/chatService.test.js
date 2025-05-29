/**
 * Test the fallback mechanism in the chat service
 * 
 * Note: The chat service now uses a custom UUID implementation instead of the
 * external uuid package. This helps avoid bundling issues in React Native.
 */
import { enableFallbackMode, getConversations } from '../src/services/chatService';

// Mock conversation for testing
const mockConversation = {
  _id: 'test-conversation-1',
  participants: ['current-user', 'test-host-1'],
  participantDetails: [
    {
      id: 'test-host-1',
      firstName: 'Test',
      lastName: 'Host',
      email: 'test@example.com',
      role: 'host',
      joinedDate: '2023-01-01'
    }
  ],
  property: {
    _id: 'test-property-1',
    title: 'Test Property',
    description: 'A test property',
    images: ['https://example.com/image.jpg'],
    price: 100,
    location: 'Test Location',
    rating: 4.5,
    reviewCount: 10
  },
  lastMessage: {
    text: 'Hello!',
    senderId: 'test-host-1',
    createdAt: new Date().toISOString(),
    read: false
  },
  unreadCount: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => {
    if (key === 'accessToken') return Promise.resolve('mock-token');
    if (key === 'currentUserId') return Promise.resolve('current-user');
    return Promise.resolve(null);
  }),
  setItem: jest.fn(() => Promise.resolve())
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.reject({ response: { status: 404 } })),
    post: jest.fn(() => Promise.reject({ response: { status: 404 } }))
  }))
}));

// Mock mockChatService
jest.mock('../src/services/mockChatService', () => ({
  setCurrentUserId: jest.fn(),
  getConversations: jest.fn(() => Promise.resolve([mockConversation])),
  getConversation: jest.fn(() => Promise.resolve(mockConversation)),
  getChatMessages: jest.fn(() => Promise.resolve([])),
  createConversation: jest.fn(() => Promise.resolve(mockConversation)),
  sendMessage: jest.fn(() => Promise.resolve({})),
  markMessagesAsRead: jest.fn(() => Promise.resolve(true)),
  getUnreadMessageCount: jest.fn(() => Promise.resolve(1)),
  getParticipantDetails: jest.fn(() => Promise.resolve([]))
}));

describe('Chat Service Fallback Mechanism', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should switch to fallback mode when API returns 404', async () => {
    // This should trigger fallback mode since axios is mocked to return 404
    const conversations = await getConversations();
    
    // It should have returned the mock conversation from mockChatService
    expect(conversations).toEqual([mockConversation]);
    
    // The mockChatService.getConversations should have been called
    expect(require('../src/services/mockChatService').getConversations).toHaveBeenCalled();
  });

  test('should use fallback mode directly if already enabled', async () => {
    // Manually enable fallback mode
    enableFallbackMode();
    
    // This should skip the API call and use mockChatService directly
    const conversations = await getConversations();
    
    // axios.create should not be called
    expect(require('axios').create).not.toHaveBeenCalled();
    
    // It should have returned the mock conversation from mockChatService
    expect(conversations).toEqual([mockConversation]);
  });
});
