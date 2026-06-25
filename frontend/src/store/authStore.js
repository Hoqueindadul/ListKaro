import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { currentConfig } from "../config";

const API_URL = currentConfig.API_URL;

axios.defaults.withCredentials = true;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isCheckingAuth: true,
      message: null,

      signup: async (email, password, name, phone) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password,
            name,
            phone,
          });
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error signing up",
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          });

          localStorage.setItem("token", response.data.token);

          set({
            isAuthenticated: true,
            user: {
              ...response.data.user,
              isVerified: response.data.user.isVarified,
            },
            error: null,
            isLoading: false,
          });

          console.log("Login successful", response.data);
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error logging in",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${API_URL}/auth/logout`);
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("token");
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        }
      },

      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/verify-email`, {
            code,
          });
          set({
            //     user: response.data.user,
            //     isAuthenticated: true,
            isLoading: false,
          });
          console.log(response.data);
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error verifying email",
            isLoading: false,
          });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/auth/check-auth`);
          const user = response.data.user;
          set({
            user: {
              ...user,
              isVerified: user.isVerified ?? user.isVarified,
            },
            isAuthenticated: true,
            isCheckingAuth: false,
          });
        } catch (error) {
          set({
            error: null,
            isCheckingAuth: false,
            isAuthenticated: false,
          });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          console.log(API_URL);
          const response = await axios.post(`${API_URL}/auth/forgot-password`, {
            email,
          });
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message ||
              "Error sending reset password email",
          });
          throw error;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/auth/reset-password/${token}`,
            { password },
          );
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Error resetting password",
          });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage", // name in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useCartStore = create((set) => ({
  cartItems: [],
  loading: false,
  error: null,

  addToCart: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/cart/add-to-cart`,
        { productId, quantity },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      set({ cartItems: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to add to cart", loading: false });
    }
  },
  fetchCartItems: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/cart/user-cart`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ cartItems: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to load cart items", loading: false });
    }
  },

  updateQuantity: (productId, newQuantity) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    }));
  },

  removeItem: async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/cart/user-cart/${productId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item._id !== productId),
      }));
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  },

  getCartCount: () => {
    const items = useCartStore.getState().cartItems;
    return items.length;
  },
}));

// product store
export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  singleProduct: null,
  createProduct: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/products/createProduct`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      set((state) => ({
        products: [...state.products, response.data.product],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: "Failed to create product", loading: false });
      console.error("Error creating product:", error);
    }
  },
  fetchSingleProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/products/singleProduct/${productId}`,
        {
          withCredentials: true,
        },
      );
      set({ singleProduct: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch single product", loading: false });
      console.error("Error fetching single product:", error);
    }
  },
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/products/getAllProducts`, {
        withCredentials: true,
      });
      set({ products: response.data.data, loading: false });
      console.log("Products fetched successfully", response.data);
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.error("Error fetching products:", error);
    }
  },
  updateProduct: async (productId, updatedData) => {
    set({ loading: true, error: null }); // Show loading state

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/products/updateProduct/${productId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      // Optionally: update the local state
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId ? response.data : product,
        ),
      }));
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false }); // Hide loading state
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      console.log("Deleting product with ID:", productId);

      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/products/deleteProduct/${productId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
        loading: false,
      }));

      console.log("Product deleted successfully");
    } catch (error) {
      set({ error: "Failed to delete product", loading: false });
      console.error("Error deleting product:", error);
    }
  },
}));

export const useBulkUploadStore = create((set) => ({
  loading: false,
  error: null,

  bulkUploadProducts: async (products) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found. Please login first.");
      }

      const response = await axios.post(
        `${API_URL}/bulk-upload`,
        { products },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      set({ loading: false });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      console.error("Error during bulk upload:", message);
      set({ error: message, loading: false });
    }
  },
  uploadList: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/upload-ocr`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      set({ loading: false });
      return response.data; // Returns the API response to the component
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to upload list";
      set({ error: errorMessage, loading: false });
      console.error("Error uploading list:", error);
      throw error; // Re-throw so the component can handle local UI changes if needed
    }
  },
}));
