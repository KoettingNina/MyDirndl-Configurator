import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../authentication/AuthContext';

// Create Context to share the shopping cart state between components
const   cartStateContext = createContext();
export function useCart() {
    return useContext(cartStateContext);
  }


/**
 * Provides a context for managing the shopping cart state.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {JSX.Element} - The rendered component.
 */
export const ShoppingCartProvider = ({ children }) => {
    const [shoppingCart, setShoppingCart] = useState([]); 
    const [totalItems, setTotalItems] = useState(0);
    const [remoteUpdate, setRemoteUpdate] = useState(false);
    const [itemCount, setItemCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        setTotalItems(getTotalItems(shoppingCart));
        setItemCount(shoppingCart.length);
    }, [shoppingCart]);

    /**
     * Calculates the total price of items in the shopping cart.
     *
     * @param {Array} items - The array of items in the shopping cart.
     * @returns {number} - The total price of the items.
     */
    const getTotalItems = (items) =>{
        var total = 0
        if(Array.isArray(items)){
        items.forEach((item) => {
          if (item.dirndl.price !== undefined){
            total += item.dirndl.price;}
        });}
        return total;}

    
    return (
        <cartStateContext.Provider value={{ shoppingCart, setShoppingCart, totalItems, remoteUpdate, setRemoteUpdate, itemCount}}>
            {children}
        </cartStateContext.Provider>
    );
};
