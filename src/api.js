import axios from 'axios';

const api = axios.create({
    baseURL: 'https://clamare-backend-new-a79c03f641bd.herokuapp.com', // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Needed if your backend uses cookies
});

export const sendContactForm = async (data) => {
    try {
        const response = await api.post('/api/contact', data);
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response || error.message);
        throw error;
    }
};
