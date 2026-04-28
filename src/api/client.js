import axios from "axios";

const client = axios.create({
  // Usamos tu IP con el puerto del BACKEND
  baseURL: "http://192.168.40.106:8000", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;