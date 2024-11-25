import axios from "axios";

const httpClient = axios.create({
  withCredentials: true,
  //baseURL: `${process.env.REACT_APP_API_BASE_URL}`,
  baseURL: "https://av-dataops-azapp-metadata-dev-001.azurewebsites.net",
  headers: {
    Accept: "application/json",    
  },
});

httpClient.interceptors.request.use((config: any) => {
  return config;
});

httpClient.interceptors.response.use(
  (res) => Promise.resolve(res),
  (err) => Promise.reject(err),
);

export default httpClient;