const axios = require("axios"); 
const baseUrl = "http://localhost:3000/api/v1";

async function testEndpoints() {
  try {
    console.log("Testing properties/search endpoint...");
    const searchUrl = `${baseUrl}/properties/search?keyword=California&city=California&country=United%20States`;
    console.log("Request URL:", searchUrl);
    
    const response = await axios.get(searchUrl);
    console.log("Status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testEndpoints();
