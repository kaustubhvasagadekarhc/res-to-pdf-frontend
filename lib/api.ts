import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    withCredentials: true, // Important: This allows cookies to be sent with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// No need for Authorization header interceptor since we're using httpOnly cookies
// The browser automatically sends cookies with each request when withCredentials is true

export default api;
