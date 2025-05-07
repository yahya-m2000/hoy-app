/**
 * Test script for property search API with rate limiting
 * 
 * This script tests the improved rate limiting solutions in the app
 * to verify they are working correctly.
 */

import { searchProperties } from "../src/services/propertyService";
import { getPropertySearchRateLimiter } from "../src/utils/rateLimitingUtils";

console.log("Starting property search API test with rate limiting...");

// Function to simulate rapid API calls
const testRapidApiCalls = async () => {
  console.log("Testing rapid API calls...");
  
  // Create test search parameters
  const searchParams = {
    keyword: "California",
    latitude: 40.066479,
    longitude: -79.889975,
    radius: 10,
    country: "United States",
  };
  
  // Array to store promises
  const results = [];
  
  // Make multiple API calls in rapid succession
  for (let i = 0; i < 12; i++) {
    console.log(`Making API call #${i + 1}...`);
    
    // Add a unique parameter to prevent identical request detection
    const uniqueParams = { 
      ...searchParams, 
      _testId: i,
      _timestamp: Date.now()
    };
    
    try {
      const result = await searchProperties(uniqueParams);
      console.log(`API call #${i + 1} completed with ${result.length} results`);
      results.push({
        callNumber: i + 1,
        resultCount: result.length,
        status: "success"
      });
    } catch (error) {
      console.error(`API call #${i + 1} failed:`, error);
      results.push({
        callNumber: i + 1,
        status: "error",
        error: error.message
      });
    }
    
    // Small delay to make the logs more readable
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Report the test results
  console.log("\nTest Results:");
  console.log("-------------");
  results.forEach(result => {
    console.log(`Call #${result.callNumber}: ${result.status}${
      result.status === "success" ? ` (${result.resultCount} results)` : ` (${result.error})`
    }`);
  });
  
  // Get the rate limiter stats
  const rateLimiter = getPropertySearchRateLimiter();
  console.log("\nRate Limiter Status:");
  console.log(`Count: ${rateLimiter.count}`);
  console.log(`Reset Time: ${new Date(rateLimiter.resetTime).toLocaleTimeString()}`);
  console.log(`Window Duration: ${rateLimiter.windowDuration}ms`);
  console.log(`Is Limit Exceeded: ${rateLimiter.isLimitExceeded()}`);
  
  console.log("\nTest completed!");
};

// Run the test
testRapidApiCalls().catch(error => {
  console.error("Test failed with error:", error);
});
