import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import '../styles/AIWaiter.css';
import Navbar from '../components/Navbar';

const AIWaiter = () => {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'ai', message: '👋 Hello! I\'m your AI menu assistant 👩‍🍳. How can I help you today?' },
        { sender: 'ai', message: '💡 You can ask me about our menu items, ingredients, prices, or special recommendations!' }
    ]);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Enhanced training data with intents and suggested questions
    const trainingData = [
        {
            intent: "greeting",
            examples: ["hello", "hi", "hey", "good morning", "good afternoon"],
            response: "👋 Hello there! I'm your AI menu assistant. How can I help you today?",
            suggested_questions: ["What's on the menu today?", "Can you show me starters?", "What are your specials?"]
        },
        {
            intent: "view_menu",
            examples: ["show me the menu", "what's on the menu", "can I see the menu", "menu please"],
            response: "📋 Sure! We offer a variety of delicious dishes. Our menu includes Starters, Main Courses, Desserts, and Beverages. What category would you like to explore?",
            suggested_questions: ["Show me starters", "What main courses do you have?", "Any dessert recommendations?"]
        },
        {
            intent: "menu_categories",
            examples: ["what categories", "menu sections", "types of food"],
            response: "📂 Our menu is organized into four main categories:\n1. Starters - Perfect to begin your meal\n2. Main Course - Hearty and satisfying dishes\n3. Desserts - Sweet treats to finish your meal\n4. Beverages - Refreshing drinks to accompany your food",
            suggested_questions: ["Show me starters", "Show me main courses", "What desserts do you have?"]
        },
        {
            intent: "specific_item_info",
            examples: ["tell me about", "what is", "information about", "details of"],
            response: "🔍 I'd be happy to provide details about that item. Could you please specify which menu item you're interested in?",
            suggested_questions: ["Tell me about the Grilled Salmon", "What's in the Margherita Pizza?", "Details about Chocolate Cake"]
        },
        {
            intent: "price_inquiry",
            examples: ["how much", "price", "cost", "expensive"],
            response: "💰 Our menu offers great value with prices ranging from affordable starters to premium main courses. What specific item would you like to know the price for?",
            suggested_questions: ["How much is the Grilled Salmon?", "What's the price of Pizza?", "Are starters expensive?"]
        },
        {
            intent: "dietary_restrictions",
            examples: ["vegetarian", "vegan", "gluten free", "allergen", "dairy free"],
            response: "🥗 We cater to various dietary needs including vegetarian, vegan, and gluten-free options. Just let me know your specific requirements!",
            suggested_questions: ["Do you have vegetarian options?", "Any vegan dishes?", "Gluten-free choices?"]
        },
        {
            intent: "recommendations",
            examples: ["recommend", "best", "popular", "favorite", "specials"],
            response: "⭐ Our chef's recommendations include:\n- Margherita Pizza (Vegetarian)\n- Grilled Salmon (Gluten-Free)\n- Chocolate Cake (Vegetarian)\n- Vegetable Stir-Fry (Vegan & Gluten-Free)\nThese are customer favorites!",
            suggested_questions: ["What's your bestseller?", "Chef's special today?", "Popular desserts?"]
        },
        {
            intent: "preparation_time",
            examples: ["how long", "preparation time", "ready in", "wait time"],
            response: "⏱️ Preparation times vary by item:\n- Starters: 8-15 minutes\n- Main Courses: 15-25 minutes\n- Desserts: 5 minutes\n- Beverages: 1-3 minutes\nWhat would you like to order?",
            suggested_questions: ["How long for Pizza?", "Quick main course options?", "Fast dessert choices?"]
        },
        {
            intent: "ingredients",
            examples: ["ingredients", "what's in", "contains", "made of"],
            response: "📝 I can provide detailed ingredient information for any of our dishes. Please let me know which specific item you're curious about!",
            suggested_questions: ["Ingredients in Garlic Bread?", "What's in the Salad?", "Pizza toppings?"]
        },
        {
            intent: "calories",
            examples: ["calories", "healthy", "nutritional", "low calorie"],
            response: "📊 We have options for various dietary goals:\n- Light choices: Sparkling Water (0 cal), Salads (150-220 cal)\n- Balanced meals: Grilled Chicken (420 cal), Vegetable Stir-Fry (280 cal)\n- Indulgent treats: Chocolate Cake (450 cal), Beef Burger (650 cal)",
            suggested_questions: ["Low-calorie options?", "Healthiest main course?", "Calories in desserts?"]
        },
        {
            intent: "availability",
            examples: ["available", "in stock", "have", "do you have"],
            response: "✅ All items on our menu are freshly prepared daily. We do our best to maintain availability of all dishes, but special requests can be accommodated with advance notice.",
            suggested_questions: ["Is Salmon available today?", "Fresh ingredients?", "Daily specials?"]
        },
        {
            intent: "order_assistance",
            examples: ["order", "place order", "want to order", "buy"],
            response: "🛒 To place an order, please visit our main menu page or speak with our staff. I can help you choose what to order, but you'll need to place the order through our official system.",
            suggested_questions: ["Help me choose dinner", "What should I order?", "Family meal ideas?"]
        },
        {
            intent: "location_and_hours",
            examples: ["location", "hours", "open", "address", "timing"],
            response: "📍 We're located at our restaurant premises. Our standard hours are:\n- Monday-Friday: 11am-10pm\n- Saturday-Sunday: 10am-11pm\nPlease check with our staff for any changes or special events.",
            suggested_questions: ["When do you open?", "Weekend hours?", "Delivery available?"]
        },
        {
            intent: "thank_you",
            examples: ["thank you", "thanks", "appreciate"],
            response: "😊 You're very welcome! I'm glad I could assist you. Is there anything else I can help with regarding our menu?",
            suggested_questions: ["Anything else to know?", "More recommendations?", "Special offers?"]
        },
        {
            intent: "goodbye",
            examples: ["bye", "goodbye", "see you", "farewell"],
            response: "👋 Thank you for chatting with me! Enjoy your meal, and please let us know if you need anything else. Have a wonderful day!",
            suggested_questions: ["Come back later?", "Different question?", "Start over?"]
        },
        {
            intent: "fallback",
            examples: [],
            response: "🤔 I'm still learning! I can help you with questions about our menu, ingredients, prices, and recommendations. Could you rephrase your question or ask about something specific on our menu?",
            suggested_questions: ["What's on the menu?", "Do you have vegetarian options?", "What are your specials?"]
        }
    ];
    
    // Hardcoded menu data
    const menuData = [
        {
            category: 'Starters',
            items: [
                {
                    name: 'Garlic Bread',
                    description: 'Freshly baked bread with garlic butter and herbs',
                    price: 5.99,
                    calories: 250,
                    preparation_time: 10,
                    allergens: ['gluten', 'dairy'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Spring Rolls',
                    description: 'Crispy vegetable spring rolls with sweet chili sauce',
                    price: 7.99,
                    calories: 180,
                    preparation_time: 15,
                    allergens: ['gluten'],
                    dietary: ['Vegetarian', 'Vegan']
                },
                {
                    name: 'Caprese Salad',
                    description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
                    price: 9.99,
                    calories: 220,
                    preparation_time: 8,
                    allergens: ['dairy'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Bruschetta',
                    description: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
                    price: 6.99,
                    calories: 150,
                    preparation_time: 10,
                    allergens: ['gluten'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Stuffed Mushrooms',
                    description: 'Mushroom caps stuffed with cheese and herbs',
                    price: 8.49,
                    calories: 180,
                    preparation_time: 20,
                    allergens: ['dairy'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Buffalo Wings',
                    description: 'Spicy chicken wings with blue cheese dip',
                    price: 10.99,
                    calories: 320,
                    preparation_time: 25,
                    allergens: ['gluten'],
                    dietary: []
                }
            ]
        },
        {
            category: 'Main Course',
            items: [
                {
                    name: 'Grilled Salmon',
                    description: 'Fresh salmon fillet with herbs and lemon butter',
                    price: 18.99,
                    calories: 350,
                    preparation_time: 20,
                    allergens: ['fish'],
                    dietary: ['Gluten-Free']
                },
                {
                    name: 'Vegetable Stir-Fry',
                    description: 'Mixed seasonal vegetables in Asian sauce with rice',
                    price: 12.99,
                    calories: 280,
                    preparation_time: 15,
                    allergens: [],
                    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free']
                },
                {
                    name: 'Margherita Pizza',
                    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
                    price: 14.99,
                    calories: 420,
                    preparation_time: 18,
                    allergens: ['gluten', 'dairy'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Beef Burger',
                    description: 'Juicy beef patty with lettuce, tomato, and cheese',
                    price: 13.99,
                    calories: 650,
                    preparation_time: 15,
                    allergens: ['gluten', 'dairy'],
                    dietary: []
                },
                {
                    name: 'Pasta Carbonara',
                    description: 'Classic Italian pasta with eggs, cheese, and pancetta',
                    price: 14.99,
                    calories: 580,
                    preparation_time: 20,
                    allergens: ['gluten', 'dairy', 'eggs'],
                    dietary: []
                },
                {
                    name: 'Grilled Chicken',
                    description: 'Herb-marinated chicken breast with vegetables',
                    price: 16.99,
                    calories: 420,
                    preparation_time: 25,
                    allergens: [],
                    dietary: []
                }
            ]
        },
        {
            category: 'Desserts',
            items: [
                {
                    name: 'Chocolate Cake',
                    description: 'Rich chocolate cake with cream and berries',
                    price: 6.99,
                    calories: 450,
                    preparation_time: 5,
                    allergens: ['gluten', 'dairy'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Fruit Tart',
                    description: 'Fresh seasonal fruit tart with pastry cream',
                    price: 7.49,
                    calories: 280,
                    preparation_time: 5,
                    allergens: ['gluten', 'dairy'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Cheesecake',
                    description: 'Creamy New York-style cheesecake with berry compote',
                    price: 7.99,
                    calories: 480,
                    preparation_time: 5,
                    allergens: ['dairy', 'gluten'],
                    dietary: ['Vegetarian']
                },
                {
                    name: 'Ice Cream Sundae',
                    description: 'Vanilla ice cream with chocolate sauce and nuts',
                    price: 6.49,
                    calories: 350,
                    preparation_time: 5,
                    allergens: ['dairy', 'nuts'],
                    dietary: ['Vegetarian']
                }
            ]
        },
        {
            category: 'Beverages',
            items: [
                {
                    name: 'Fresh Orange Juice',
                    description: 'Freshly squeezed orange juice',
                    price: 3.99,
                    calories: 110,
                    preparation_time: 2,
                    allergens: [],
                    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free']
                },
                {
                    name: 'Espresso Coffee',
                    description: 'Strong Italian espresso coffee',
                    price: 2.49,
                    calories: 5,
                    preparation_time: 3,
                    allergens: [],
                    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free']
                },
                {
                    name: 'Craft Beer',
                    description: 'Local craft beer selection',
                    price: 5.99,
                    calories: 150,
                    preparation_time: 1,
                    allergens: ['gluten'],
                    dietary: []
                },
                {
                    name: 'Sparkling Water',
                    description: 'Premium sparkling water with lime',
                    price: 3.49,
                    calories: 0,
                    preparation_time: 1,
                    allergens: [],
                    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free']
                }
            ]
        }
    ];
    
    const { 
        transcript, 
        listening, 
        resetTranscript, 
        browserSupportsSpeechRecognition 
    } = useSpeechRecognition();
    








    // Initialize with greeting suggestions
    useEffect(() => {
        const greetingIntent = trainingData.find(intent => intent.intent === "greeting");
        if (greetingIntent) {
            setSuggestedQuestions(greetingIntent.suggested_questions);
        }
    }, []);
    
    // Auto-scroll to bottom of chat
    useEffect(() => {
        const chatHistoryElement = document.getElementById('chat-history');
        if (chatHistoryElement) {
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
        }
    }, [chatHistory, isLoading]);
    
    // Handle voice input
    useEffect(() => {
        if (transcript && !listening) {
            setChatInput(transcript);
        }
    }, [transcript, listening]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = document.querySelector('.chat-input');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
        }
    }, [chatInput]);

    const startListening = () => {
        if (browserSupportsSpeechRecognition) {
            SpeechRecognition.startListening({ continuous: true });
        } else {
            alert('Browser does not support speech recognition.');
        }
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    // Find the best matching intent
    const findBestIntent = (input) => {
        const lowerInput = input.toLowerCase();
        
        // First check for exact matches in examples
        for (const intent of trainingData) {
            if (intent.examples.some(example => lowerInput.includes(example))) {
                return intent;
            }
        }
        
        // If no exact match, check for partial matches
        for (const intent of trainingData) {
            if (intent.intent !== "fallback" && 
                (intent.intent.includes("menu") && lowerInput.includes("menu")) ||
                (intent.intent.includes("price") && (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("how much"))) ||
                (intent.intent.includes("dietary") && (lowerInput.includes("vegetarian") || lowerInput.includes("vegan") || lowerInput.includes("gluten"))) ||
                (intent.intent.includes("recommend") && (lowerInput.includes("recommend") || lowerInput.includes("best") || lowerInput.includes("popular"))) ||
                (intent.intent.includes("thank") && lowerInput.includes("thank")) ||
                (intent.intent.includes("greeting") && (lowerInput.includes("hello") || lowerInput.includes("hi")))
            ) {
                return intent;
            }
        }
        
        // Return fallback if no match found
        return trainingData.find(intent => intent.intent === "fallback");
    };
    
    // Generate response based on intent
    const generateResponse = (input) => {
        const intent = findBestIntent(input);
        
        // Set suggested questions for next interaction
        setSuggestedQuestions(intent.suggested_questions || []);
        
        // Handle specific item inquiries
        if (intent.intent === "specific_item_info" || intent.intent === "price_inquiry" || 
            intent.intent === "ingredients" || intent.intent === "calories") {
            
            // Look for specific food items
            let foundItem = null;
            
            // Check each menu item name
            outerLoop: for (const category of menuData) {
                for (const item of category.items) {
                    if (input.toLowerCase().includes(item.name.toLowerCase())) {
                        foundItem = item;
                        break outerLoop;
                    }
                }
            }
            
            if (foundItem) {
                switch(intent.intent) {
                    case "specific_item_info": 
                        return `${foundItem.name}: ${foundItem.description}. Price: ₹${foundItem.price}. Preparation time: ${foundItem.preparation_time} minutes.`;
                    case "price_inquiry": 
                        return `The ${foundItem.name} is priced at ₹${foundItem.price}.`;
                    case "ingredients": 
                        const allergens = foundItem.allergens.length > 0 ? 
                            `Allergens: ${foundItem.allergens.join(', ')}. ` : '';
                        const dietary = foundItem.dietary.length > 0 ? 
                            `Dietary info: ${foundItem.dietary.join(', ')}. ` : '';
                        return `${foundItem.name}: ${foundItem.description}. ${allergens}${dietary}`;
                    case "calories": 
                        return `The ${foundItem.name} contains ${foundItem.calories} calories and takes ${foundItem.preparation_time} minutes to prepare.`;
                }
            }
        }
        
        // Handle category-specific inquiries
        if (intent.intent === "view_menu" || intent.intent === "menu_categories") {
            const categoryMatch = menuData.find(cat => 
                input.toLowerCase().includes(cat.category.toLowerCase()) || 
                cat.category.toLowerCase().includes(input.toLowerCase())
            );
            
            if (categoryMatch) {
                const itemNames = categoryMatch.items.map(item => item.name).join(', ');
                const minPrice = Math.min(...categoryMatch.items.map(i => i.price));
                const maxPrice = Math.max(...categoryMatch.items.map(i => i.price));
                return `In our ${categoryMatch.category} section, we have: ${itemNames}. Prices range from ₹${minPrice} to ₹${maxPrice}.`;
            }
        }
        
        // Handle dietary restrictions
        if (intent.intent === "dietary_restrictions") {
            if (input.toLowerCase().includes('vegetarian')) {
                const vegetarianItems = menuData.flatMap(cat => 
                    cat.items.filter(item => item.dietary.includes('Vegetarian'))
                        .map(item => item.name)
                );
                return `We have several vegetarian options including: ${vegetarianItems.slice(0, 5).join(', ')}.`;
            } else if (input.toLowerCase().includes('vegan')) {
                const veganItems = menuData.flatMap(cat => 
                    cat.items.filter(item => item.dietary.includes('Vegan'))
                        .map(item => item.name)
                );
                return `We have several vegan options including: ${veganItems.join(', ')}.`;
            } else if (input.toLowerCase().includes('gluten-free') || input.toLowerCase().includes('gluten free')) {
                const gfItems = menuData.flatMap(cat => 
                    cat.items.filter(item => item.dietary.includes('Gluten-Free'))
                        .map(item => item.name)
                );
                return `We have several gluten-free options including: ${gfItems.join(', ')}.`;
            }
        }
        
        // Return default response for the intent
        return intent.response;
    };

    const handleSend = () => {
        if (chatInput.trim()) {
            // Add user message to chat history
            const userMessage = { sender: 'user', message: chatInput };
            setChatHistory(prev => [...prev, userMessage]);
            
            // Set loading state
            setIsLoading(true);
            
            // Generate AI response based on enhanced training data
            setTimeout(() => {
                const response = generateResponse(chatInput);
                setChatHistory(prev => [
                    ...prev,
                    { sender: 'ai', message: response }
                ]);
                setIsLoading(false);
            }, 500);
            
            // Clear input and reset speech recognition
            setChatInput('');
            resetTranscript();
        }
    };

    return (
        <div className="ai-waiter-container">
            <Navbar />
            <div style={{ height: '70px' }}></div> {/* Spacer for navbar */}
            <div className="ai-waiter-header">
                <h1>AI Menu Assistant</h1>
                {/* <p className="header-subtitle">Your personal dining companion</p> */}
            </div>
            
            <div className="chat-container">
                {/* Chat History */}
                <div className="chat-history" id="chat-history">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`message ${chat.sender}`}>
                            <div className="message-avatar">
                                {chat.sender === 'user' ? '👤' : '👨‍🍳'}
                            </div>
                            <div className="message-content">
                                <div className="message-text">{chat.message}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message ai">
                            <div className="message-avatar">👨‍🍳</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Suggestions */}
                {suggestedQuestions.length > 0 && (
                    <div className="suggestions-section">
                        <div className="suggestions-title">Try asking:</div>
                        <div className="suggestions-container">
                            {suggestedQuestions.slice(0, 4).map((question, index) => (
                                <button 
                                    key={index}
                                    className="suggestion-chip"
                                    onClick={() => {
                                        setChatInput(question);
                                        // Auto-send the suggestion
                                        setTimeout(() => {
                                            const userMessage = { sender: 'user', message: question };
                                            setChatHistory(prev => [...prev, userMessage]);
                                            setIsLoading(true);
                                            setTimeout(() => {
                                                const response = generateResponse(question);
                                                setChatHistory(prev => [
                                                    ...prev,
                                                    { sender: 'ai', message: response }
                                                ]);
                                                setIsLoading(false);
                                            }, 500);
                                        }, 100);
                                    }}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Fixed Input Area */}
                <div className="input-area">
                    <div className="input-container">
                        <textarea
                            className="chat-input"
                            value={chatInput || transcript}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Message AI Menu Assistant..."
                            rows="1"
                        />
                        <div className="input-actions">
                            <button 
                                className="send-button"
                                onClick={handleSend}
                                disabled={!chatInput.trim() && !transcript}
                            >
                                ➤
                            </button>
                            {browserSupportsSpeechRecognition && (
                                <button 
                                    className={`mic-button ${listening ? 'active' : ''}`}
                                    onClick={listening ? stopListening : startListening}
                                >
                                    {listening ? '⏹' : '🎤'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="input-footer">
                        AI Menu Assistant can make mistakes. Consider checking important information.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIWaiter;