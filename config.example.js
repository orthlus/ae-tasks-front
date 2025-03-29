const API_CONFIG = {
    BASE_URL: 'https://api.example.com',
    AUTH_ENDPOINT: '/login'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG; // Node.js
} else {
    window.API_CONFIG = API_CONFIG; // browser
}