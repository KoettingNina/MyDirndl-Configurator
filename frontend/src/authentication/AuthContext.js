import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthenticationContext = createContext(null);

export function useAuth() {
  return useContext(AuthenticationContext);
}

/**
 * Provides authentication functionality to the application.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {ReactNode} The rendered component.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tailor, setTailor] = useState(null);

  /**
   * Logs in a user with the provided credentials.
   * @param {Object} creds - The user credentials.
   * @param {string} creds.username - The username.
   * @param {string} creds.password - The password.
   * @returns {Promise<Object>} A promise that resolves to an object with the login result.
   * @throws {Error} If an unexpected error occurs during login.
   */
  const login = async (creds) => {
    try {
      const response = await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/login`,
        data: creds,
        withCredentials: true,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      
      localStorage.setItem("user", 1);
      setUser(response.data._id);
      console.log("User logged in: ", response.data._id);
      return { success: true };
    } catch (error) {
      console.error("Login error: ", error);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          "An unexpected error occurred. Please try again.",
      };
    }
  };

  /**
   * Logs in a tailor with the provided credentials.
   * @param {Object} creds - The credentials of the tailor.
   * @param {string} creds.email - The email of the tailor.
   * @param {string} creds.password - The password of the tailor.
   * @returns {Promise<Object>} A promise that resolves to an object with the login result.
   * @throws {Error} If an unexpected error occurs during the login process.
   */
  const loginTailor = async (creds) => {
    try {
      const response = await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/login`,
        data: creds,
        withCredentials: true,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      //localStorage.setItem("tailor", JSON.stringify(response.data));
      localStorage.setItem("tailor", 1);
      setUser(response.data._id);
      setTailor(response.data._id);
      console.log("Tailor logged in: ", response.data._id);
      return { success: true };
    } catch (error) {
      console.error("Login error: ", error);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          "An unexpected error occurred. Please try again.",
      };
    }
  };

  /**
   * Registers a new customer.
   *
   * @param {Object} data - The customer data to be registered.
   * @returns {Promise} A promise that resolves to the response from the server.
   * @throws {Error} If an error occurs during the registration process.
   */
  const register = async (data) => {
    try {
      const response = await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/register`,
        data,
        withCredentials: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Registers a tailor by making a POST request to the backend API.
   * @param {Object} data - The data to be sent in the request body.
   * @returns {Promise} A promise that resolves to the response from the backend API.
   * @throws {Error} If an error occurs during the request.
   */
  const tailorRegister = async (data) => {
    try {
      const response = await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/register`,
        data,
        withCredentials: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logs out the user by making a POST request to the logout endpoint.
   * Removes the token and user data from the local storage and sets the user to null.
   * @returns {boolean} Returns true if the logout was successful, false otherwise.
   */
  const logout = async () => {
    try {
      await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/logout`,
        withCredentials: true,
      });
      // .then((response) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Logs out the tailor by sending a POST request to the backend API and removing the token and tailor data from local storage.
   * @returns {Promise<boolean>} A promise that resolves to true if the logout is successful, or false if there is an error.
   */
  const logoutTailor = async () => {
    try {
      await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/logout`,
        withCredentials: true,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("tailor");
      setUser(null);
      setTailor(null);
      return true
    } catch (error) {
      return false;
    }
  };

  /**
   * Checks the authentication status of the user by sending a request to the server.
   * If the user is authenticated, it sets the user or tailor ID in the state.
   * If the user is not authenticated or an error occurs, it sets the user and tailor ID to null.
   */
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios({
          method: "GET",
          url:`http://${process.env.REACT_APP_BACKEND_URL}:8080/api/check-auth`,
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (response.status === 200) {
          const isTailor = localStorage.getItem("tailor");
          if (isTailor) {
            setTailor(response.data.user._id);
          } else {
            setUser(response.data.user._id);
          }
        }
      } catch (error) {
        console.error("Token validation failed", error);
        setUser(null);
        setTailor(null);
      }
    }
  };

  /**
   * Runs once when the component is mounted.
   * It checks the authentication status of the user.
   * Ensures reload without losing the authentication status
   */
  useEffect(() => {
    console.log("UseEffect in AuthContext wird ausgeführt");
    checkAuth();
  }, []);


  return (
    <AuthenticationContext.Provider
      value={{
        login,
        logout,
        user,
        register,
        loginTailor,
        tailor,
        logoutTailor,
        tailorRegister,
        checkAuth,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
