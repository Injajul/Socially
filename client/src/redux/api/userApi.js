import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  withCredentials: true,
});

export const createUser = (formData, token) =>
  api.post("/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Clerk JWT
    },
  });

export const updateUser = (clerkId, formData, token) =>
  api.put(`/${clerkId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

export const CurrentAuthUser = (token) =>
  api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const fetchAllUserAPI = () => api.get("/all");

// 👇 Toggle follow/unfollow a user
export const toggleFollowAPI = (userId, token) =>
  api.put(`/${userId}/follow`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


