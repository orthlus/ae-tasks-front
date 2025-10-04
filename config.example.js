const API_CONFIG = {
    BASE_URL: '/api'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG; // Node.js
} else {
    window.API_CONFIG = API_CONFIG; // browser
}