import axios from 'axios';

// Always use the backend URL when deployed to Render
const baseUrl = 'https://wikidash-backend.onrender.com';

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: baseUrl
});

export default api;