import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { useChatConversations, useUnreadMessageCount } from '../src/hooks/useChatAPI';
import * as chatService from '../src/services/chatService';

// Mock the chat service module
jest.mock('../src/services/chatService', () => ({
  getConversations: jest.fn(),
  getUnreadMessageCount: jest.fn(),
}));

// Mock React Native's AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Test component that uses our hooks
const TestComponent = ({ options = {} }) => {
  const { conversations, loading, error, refresh } = useChatConversations(options);
  const { unreadCount } = useUnreadMessageCount(options);
  
  return (
    <div data-testid="test-component">
      <div data-testid="conversations-count">{conversations.length}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <button data-testid="refresh-button" onClick={refresh}>Refresh</button>
    </div>
  );
};

describe('Chat API Rate Limiting Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock successful API responses
    chatService.getConversations.mockResolvedValue([{ id: '1', lastMessage: 'Hello' }]);
    chatService.getUnreadMessageCount.mockResolvedValue(5);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  test('should fetch conversations and unread count on mount', async () => {
    const { getByTestId } = render(<TestComponent />);
    
    // Allow the effect to run (initial delay)
    await act(async () => {
      await jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(chatService.getConversations).toHaveBeenCalledTimes(1);
      expect(chatService.getUnreadMessageCount).toHaveBeenCalledTimes(1);
      expect(getByTestId('conversations-count').textContent).toBe('1');
      expect(getByTestId('unread-count').textContent).toBe('5');
    });
  });
  
  test('should respect polling intervals', async () => {
    render(<TestComponent options={{ 
      polling: true,
      pollingInterval: 5000 // 5 seconds
    }} />);
    
    // Initial calls after startup delay
    await act(async () => {
      await jest.advanceTimersByTime(1000);
    });
    
    expect(chatService.getConversations).toHaveBeenCalledTimes(1);
    expect(chatService.getUnreadMessageCount).toHaveBeenCalledTimes(1);
    
    // Advance timers by 3 seconds - should not call APIs yet
    await act(async () => {
      await jest.advanceTimersByTime(3000);
    });
    
    expect(chatService.getConversations).toHaveBeenCalledTimes(1);
    expect(chatService.getUnreadMessageCount).toHaveBeenCalledTimes(1);
    
    // Advance timers by another 3 seconds (total 6s) - should call APIs again
    await act(async () => {
      await jest.advanceTimersByTime(3000);
    });
    
    expect(chatService.getConversations).toHaveBeenCalledTimes(2);
    expect(chatService.getUnreadMessageCount).toHaveBeenCalledTimes(2);
  });
  
  test('should handle errors gracefully', async () => {
    // Setup API to return error
    const error = new Error('API error');
    chatService.getConversations.mockRejectedValue(error);
    
    const { getByTestId } = render(<TestComponent />);
    
    // Allow the effect to run (initial delay)
    await act(async () => {
      await jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(getByTestId('error').textContent).toBe('API error');
    });
    
    // Should still poll despite error
    await act(async () => {
      await jest.advanceTimersByTime(30000);
    });
    
    // Should have tried again
    expect(chatService.getConversations).toHaveBeenCalledTimes(2);
  });
  
  test('refresh function should work correctly', async () => {
    const { getByTestId } = render(<TestComponent />);
    
    // Allow the effect to run (initial delay)
    await act(async () => {
      await jest.advanceTimersByTime(1000);
    });
    
    // Initial call
    expect(chatService.getConversations).toHaveBeenCalledTimes(1);
    
    // Trigger manual refresh
    await act(async () => {
      getByTestId('refresh-button').props.onClick();
    });
    
    // Should call API again immediately
    expect(chatService.getConversations).toHaveBeenCalledTimes(2);
  });
  
  test('should not poll when polling is disabled', async () => {
    render(<TestComponent options={{ polling: false }} />);
    
    // Initial call should not happen
    await act(async () => {
      await jest.advanceTimersByTime(2000);
    });
    
    expect(chatService.getConversations).not.toHaveBeenCalled();
    expect(chatService.getUnreadMessageCount).not.toHaveBeenCalled();
  });
  
  test('should cleanup timers on unmount', async () => {
    const { unmount } = render(<TestComponent />);
    
    // Allow the effect to run (initial delay)
    await act(async () => {
      await jest.advanceTimersByTime(1000);
    });
    
    // Initial call
    expect(chatService.getConversations).toHaveBeenCalledTimes(1);
    
    // Unmount the component
    unmount();
    
    // Advance timers - should not trigger more API calls
    await act(async () => {
      await jest.advanceTimersByTime(60000);
    });
    
    // No additional calls after unmount
    expect(chatService.getConversations).toHaveBeenCalledTimes(1);
  });
});

describe('Chat Service Rate Limiting Integration', () => {
  // Save original implementations
  const originalShouldAllowApiCall = jest.requireActual('../src/utils/rateLimiting').shouldAllowApiCall;
  const originalGetCachedApiResponse = jest.requireActual('../src/utils/rateLimiting').getCachedApiResponse;
  
  beforeEach(() => {
    jest.resetModules();
    // Direct import of the module to test
    jest.mock('../src/utils/rateLimiting', () => ({
      shouldAllowApiCall: jest.fn(),
      getCachedApiResponse: jest.fn(),
      cacheApiResponse: jest.fn(),
      trackApiError: jest.fn()
    }));
  });
  
  test('should respect rate limiting in chatService.getConversations', async () => {
    const rateLimiting = require('../src/utils/rateLimiting');
    
    // Mock the shouldAllowApiCall to return false (rate limited)
    rateLimiting.shouldAllowApiCall.mockReturnValue(false);
    
    // Mock cached data
    const cachedData = [{ id: 'cached', name: 'Cached Conversation' }];
    rateLimiting.getCachedApiResponse.mockReturnValue(cachedData);
    
    // Import the service now that we've set up the mocks
    const chatService = require('../src/services/chatService');
    
    // Call the function
    const result = await chatService.getConversations();
    
    // It should check rate limiting for correct endpoint
    expect(rateLimiting.shouldAllowApiCall).toHaveBeenCalledWith('/chat');
    
    // It should try to get cached data
    expect(rateLimiting.getCachedApiResponse).toHaveBeenCalledWith('/chat');
    
    // It should return the cached data
    expect(result).toEqual(cachedData);
  });
  
  test('should respect rate limiting in chatService.getUnreadMessageCount', async () => {
    const rateLimiting = require('../src/utils/rateLimiting');
    
    // Mock the shouldAllowApiCall to return false (rate limited)
    rateLimiting.shouldAllowApiCall.mockReturnValue(false);
    
    // Mock cached data
    rateLimiting.getCachedApiResponse.mockReturnValue(10);
    
    // Import the service now that we've set up the mocks
    const chatService = require('../src/services/chatService');
    
    // Call the function
    const result = await chatService.getUnreadMessageCount();
    
    // It should check rate limiting for correct endpoint
    expect(rateLimiting.shouldAllowApiCall).toHaveBeenCalledWith('/chat/unread/count');
    
    // It should try to get cached data
    expect(rateLimiting.getCachedApiResponse).toHaveBeenCalledWith('/chat/unread/count');
    
    // It should return the cached data
    expect(result).toBe(10);
  });
});
