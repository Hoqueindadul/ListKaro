import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/auth"
    : "/api/auth";

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

            signup: async (email, password, name) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/signup`, {
                        email,
                        password,
                        name,
                    });
                    set({ user: response.data.user, isAuthenticated: true, isLoading: false });
                    console.log("Sign up successful", response.data);
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
                    const response = await axios.post(`${API_URL}/login`, {
                        email,
                        password,
                    });

                    localStorage.setItem("token", response.data.jwt); // optional if you use Authorization headers

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
                    await axios.post(`${API_URL}/logout`);
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
                    const response = await axios.post(`${API_URL}/verify-email`, { code });
                    set({
                        user: response.data.user,
                        isAuthenticated: true,
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
                    const response = await axios.get(`${API_URL}/check-auth`);
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
                    const response = await axios.post(`${API_URL}/forgot-password`, { email });
                    set({ message: response.data.message, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Error sending reset password email",
                    });
                    throw error;
                }
            },

            resetPassword: async (token, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
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
        }
    )
);


const CART_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/cart"
    : "/api/cart";

export const useCartStore = create((set) => ({
    cartItems: [],
    loading: false,
    error: null,

    fetchCartItems: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${CART_API_URL}/user-cart`, {
                withCredentials: true,
            });
            set({ cartItems: response.data.data, loading: false });
        } catch (error) {
            set({ error: "Failed to load cart items", loading: false });
        }
    },

    updateQuantity: (productId, newQuantity) => {
        set((state) => ({
            cartItems: state.cartItems.map((item) =>
                item._id === productId ? { ...item, quantity: newQuantity } : item
            ),
        }));
    },

    removeItem: async (productId) => {
        try {
            await axios.delete(`${CART_API_URL}/user-cart/${productId}`, {
                withCredentials: true,
            });
            set((state) => ({
                cartItems: state.cartItems.filter((item) => item._id !== productId),
            }));
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    },

    getCartCount: () => {
        const items = useCartStore.getState().cartItems;
        console.log("Cart count:", items.length);
        return items.length;


    }
}));


const PRODUCT_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/products/"
    : "/api/products/";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    error: null,
    createProduct: async (formData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${PRODUCT_API_URL}createProduct`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            set((state) => ({
                products: [...state.products, response.data.product],
                loading: false,
            }));
            return response.data
        } catch (error) {
            set({ error: "Failed to create product", loading: false });
            console.error("Error creating product:", error);
        }
    }
    ,
    fetchProducts: async () => {
        set({ loading: true, error: null })
        try {
            const response = await axios.get(`${PRODUCT_API_URL}getAllProducts`, {
                withCredentials: true,
            })
            set({ products: response.data.data, loading: false })
            console.log("Products fetched successfully", response.data);

        } catch (error) {
            set({ error: "Failed to fetch products", loading: false })
            console.error("Error fetching products:", error);

        }
    },
    updateProduct: async (productId, updatedData) => {
        set({ loading: true, error: null }); // Show loading state

        try {
            const response = await axios.put(
                `${PRODUCT_API_URL}updateProduct/${productId}`,
                updatedData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Optionally: update the local state
            set((state) => ({
                products: state.products.map((product) =>
                    product._id === productId ? response.data : product
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

            await axios.delete(`${PRODUCT_API_URL}deleteProduct/${productId}`, {
                withCredentials: true,
            });

            set((state) => ({
                products: state.products.filter(product => product._id !== productId),
                loading: false
            }));

            console.log("Product deleted successfully");
        } catch (error) {
            set({ error: "Failed to delete product", loading: false });
            console.error("Error deleting product:", error);
        }
    }

}))


const ONE_CLICK_BUY_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/"
    : "/api/";

export const useBulkUploadStore = create((set) => ({
    bulkUploadProducts: async (products) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${ONE_CLICK_BUY_URL}bulk-upload`, { products }, {
                withCredentials: true,
            });
            set({ loading: false });
            console.log("Bulk upload successful", response.data);
        } catch (error) {
            set({ error: "Failed to bulk upload products", loading: false });
            console.error("Error during bulk upload:", error);
        }
    },
}));