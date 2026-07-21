const ENVIRONMENT = import.meta.env.VITE_APP_ENV || "development";

const config = {
  development: {
    API_URL: "http://localhost:5000/api",
  },
  production: {
    API_URL: "https://listkaro-1.onrender.com/api",
  },
};

export const currentConfig = config[ENVIRONMENT];
