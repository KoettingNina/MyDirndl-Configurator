import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./components/Homepage";
import ConfigurationPage from "./components/ConfigurationPage";
import InspirationPage from "./components/InspirationPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import PaymentPage from "./components/PaymentPage";
import { ThemeProvider, Typography, createTheme } from "@mui/material";
import Theme from "./components/Theme";
import OrderOverview from "./components/OrderOverview";
import OrderDetailPage from "./components/OrderDetail";
import TailorItemsPage from "./components/TailorItemsPage";
import CustomerSettingsPage from "./components/CustomerSettingsPage";
import TailorSettingsPage from "./components/TailorSettingsPage";

import ItemsFinishedPage from "./components/ItemsFinishedPage";

import SavedDesigns from "./components/SavedDesigns";

import { AuthProvider, useAuth } from "./authentication/AuthContext";
import { ShoppingCartProvider } from "./components/ShoppingCart/ShoppingCartProvider";

import PaymentSuccessPage from "./components/PaymentSuccessPage";
import TailorHomepage from "./components/TailorHomepage";

function App() {
  const [message, setMessage] = useState("");

  // useEffect(() => {
  //   fetch("http://localhost:8080/")
  //     .then((response) => response.text())
  //     .then((data) => setMessage(data));
  // }, []);

  const theme = createTheme(Theme);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ShoppingCartProvider>
          <NavBar />
          {/* <Typography> {message}</Typography> */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tailorhome" element={<TailorHomepage />} />
            <Route path="/configuration" element={<ConfigurationPage />} />
            <Route path="/inspiration" element={<InspirationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/saved" element={<SavedDesigns />} />
            <Route path="/order" element={<OrderOverview />} />
            <Route path="/order/:orderId" element={<OrderDetailPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/tailorItems" element={<TailorItemsPage />} />
            <Route path="/itemsFinished" element={<ItemsFinishedPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/customersettings" element={<CustomerSettingsPage />}/>
            <Route path="/tailorsettings" element={<TailorSettingsPage />} />
          </Routes>
          </ShoppingCartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
