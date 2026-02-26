import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
    const [cartRecovered, setCartRecovered] = useState(false);
    
    // Initialize cart from localStorage or empty array
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('digitalMenuCart');
            const savedTimestamp = localStorage.getItem('digitalMenuCartTimestamp');
            
            if (savedCart && savedTimestamp) {
                const cartAge = Date.now() - parseInt(savedTimestamp, 10);
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                
                // If cart is older than 24 hours, clear it
                if (cartAge > maxAge) {
                    localStorage.removeItem('digitalMenuCart');
                    localStorage.removeItem('digitalMenuCartTimestamp');
                    localStorage.removeItem('digitalMenuTableNumber');
                    return [];
                }
                
                const parsedCart = JSON.parse(savedCart);
                if (parsedCart.length > 0) {
                    setCartRecovered(true);
                    // Hide notification after 3 seconds
                    setTimeout(() => setCartRecovered(false), 3000);
                }
                return parsedCart;
            }
            return [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });
    
    // Initialize table number from localStorage or 0
    const [TableNumber, setTableNumber] = useState(() => {
        try {
            const savedTableNumber = localStorage.getItem('digitalMenuTableNumber');
            return savedTableNumber ? parseInt(savedTableNumber, 10) : 0;
        } catch (error) {
            console.error('Error loading table number from localStorage:', error);
            return 0;
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('digitalMenuCart', JSON.stringify(cart));
            localStorage.setItem('digitalMenuCartTimestamp', Date.now().toString());
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);

    // Save table number to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('digitalMenuTableNumber', TableNumber.toString());
        } catch (error) {
            console.error('Error saving table number to localStorage:', error);
        }
    }, [TableNumber]);

    // Add item to cart with optional customizations
    const addToCart = (item, customizations = "") => {
        setCart((prevCart) => {
            // Create a unique identifier including customizations
            const itemKey = `${item.id}_${customizations}`;
            const existingItem = prevCart.find((cartItem) => 
                cartItem.id === item.id && cartItem.customizations === customizations
            );
            
            return existingItem
                ? prevCart.map((cartItem) =>
                    cartItem.id === item.id && cartItem.customizations === customizations 
                        ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                        : cartItem
                )
                : [...prevCart, { ...item, quantity: 1, customizations, itemKey }];
        });
    };

    // Decrease quantity or remove item (using itemKey for unique identification)
    const decreaseQuantity = (itemKey) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => (item.itemKey === itemKey ? { ...item, quantity: item.quantity - 1 } : item))
                .filter((item) => item.quantity > 0)
        );
    };

    // Update customization for an existing cart item
    const updateCustomization = (itemKey, customizations) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.itemKey === itemKey ? { ...item, customizations } : item
            )
        );
    };

    // Clear the cart and localStorage
    const clearCart = () => {
        setCart([]);
        try {
            localStorage.removeItem('digitalMenuCart');
            localStorage.removeItem('digitalMenuTableNumber');
        } catch (error) {
            console.error('Error clearing cart from localStorage:', error);
        }
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            decreaseQuantity, 
            clearCart, 
            updateCustomization, 
            setTableNumber, 
            setCart, 
            TableNumber,
            cartRecovered 
        }}>
            {children}
        </CartContext.Provider>
    );
};
