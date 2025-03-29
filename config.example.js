const API_CONFIG = {
    BASE_URL: 'https://api.example.com'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG; // Node.js
} else {
    window.API_CONFIG = API_CONFIG; // browser
}