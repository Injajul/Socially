
const USE_LOCAL = true; 

const BASE_DOMAIN = USE_LOCAL
  ?"https://socially-d8k0.onrender.com": "http://localhost:5004"

  

export const API_BASE_URL = `${BASE_DOMAIN}/api`;