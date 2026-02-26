import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, Save, X, CheckCircle } from 'lucide-react';
import { useMenu } from '../hooks/useMenu'; // Import the menu hook
import apiService from '../services/apiService'; // Import API service
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';
import './AllergenManagement.css';

const AllergenManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [newRestriction, setNewRestriction] = useState({ name: '', description: '' });
    const [showAddRestriction, setShowAddRestriction] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const {
        loading: menuLoading,
        error: menuError,
        fetchMenuItems,
        updateMenuItemAllergens,
        updateMenuItemDietaryRestrictions
    } = useMenu(); // Use the menu hook

    const commonAllergens = [
        'gluten', 'dairy', 'eggs', 'nuts', 'peanuts', 'tree nuts', 'soy', 
        'fish', 'seafood', 'shellfish', 'sesame', 'mustard', 'celery'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menuResponse, restrictionsResponse] = await Promise.all([
                fetchMenuItems(),
                apiService.getDietaryRestrictions()
            ]);

            setMenuItems(menuResponse);
            setDietaryRestrictions(restrictionsResponse.data.dietaryRestrictions);
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleUpdateAllergens = async (itemId, newAllergens) => {
        try {
            await updateMenuItemAllergens(itemId, newAllergens);
            
            setMenuItems(prev => prev.map(item => 
                item.id === itemId ? { ...item, allergens: newAllergens } : item
            ));
            
            showMessage('success', 'Allergens updated successfully');
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating allergens:', error);
            showMessage('error', 'Failed to update allergens');
        }
    };

    const handleUpdateDietaryRestrictions = async (itemId, restrictionIds) => {
        try {
            await updateMenuItemDietaryRestrictions(itemId, restrictionIds);
            
            // Refresh data to get updated restrictions
            fetchData();
            showMessage('success', 'Dietary restrictions updated successfully');
        } catch (error) {
            console.error('Error updating dietary restrictions:', error);
            showMessage('error', 'Failed to update dietary restrictions');
        }
    };

    const handleAddRestriction = async () => {
        try {
            await apiService.addDietaryRestriction(newRestriction);
            
            setNewRestriction({ name: '', description: '' });
            setShowAddRestriction(false);
            fetchData();
            showMessage('success', 'Dietary restriction added successfully');
        } catch (error) {
            console.error('Error adding restriction:', error);
            showMessage('error', 'Failed to add dietary restriction');
        }
    };

    const AllergenEditor = ({ item, onSave, onCancel }) => {
        const [allergens, setAllergens] = useState(item.allergens || []);
        const [restrictions, setRestrictions] = useState(
            item.dietary_restrictions ? item.dietary_restrictions.map(dr => 
                dietaryRestrictions.find(d => d.name === dr)?.id
            ).filter(Boolean) : []
        );

        const toggleAllergen = (allergen) => {
            setAllergens(prev => 
                prev.includes(allergen) 
                    ? prev.filter(a => a !== allergen)
                    : [...prev, allergen]
            );
        };

        const toggleRestriction = (restrictionId) => {
            setRestrictions(prev => 
                prev.includes(restrictionId)
                    ? prev.filter(r => r !== restrictionId)
                    : [...prev, restrictionId]
            );
        };

        const handleSave = () => {
            handleUpdateAllergens(item.id, allergens);
            handleUpdateDietaryRestrictions(item.id, restrictions);
            onSave();
        };

        return (
            <div className="allergen-editor">
                <h4>Editing: {item.name}</h4>
                
                <div className="editor-section">
                    <h5>Allergens</h5>
                    <div className="allergen-tags">
                        {commonAllergens.map(allergen => (
                            <button
                                key={allergen}
                                className={`allergen-tag ${allergens.includes(allergen) ? 'active' : ''}`}
                                onClick={() => toggleAllergen(allergen)}
                            >
                                {allergen}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="editor-section">
                    <h5>Dietary Restrictions</h5>
                    <div className="restriction-checkboxes">
                        {dietaryRestrictions.map(restriction => (
                            <label key={restriction.id} className="restriction-checkbox">
                                <input
                                    type="checkbox"
                                    checked={restrictions.includes(restriction.id)}
                                    onChange={() => toggleRestriction(restriction.id)}
                                />
                                <span>{restriction.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="editor-actions">
                    <button className="save-btn" onClick={handleSave}>
                        <Save size={16} />
                        Save Changes
                    </button>
                    <button className="cancel-btn" onClick={onCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <div className="allergen-management">
                    <div className="loading">Loading allergen management...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="allergen-management">
                <div className="page-header">
                    <h1>
                        <AlertTriangle />
                        Allergen & Dietary Restriction Management
                    </h1>
                    <p>Manage allergen information and dietary restrictions for menu items</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Dietary Restrictions Management */}
                <div className="section">
                    <div className="section-header">
                        <h2>Dietary Restrictions</h2>
                        <button 
                            className="add-btn"
                            onClick={() => setShowAddRestriction(true)}
                        >
                            <Plus size={16} />
                            Add New Restriction
                        </button>
                    </div>

                    {showAddRestriction && (
                        <div className="add-restriction-form">
                            <input
                                type="text"
                                placeholder="Restriction name (e.g., Keto)"
                                value={newRestriction.name}
                                onChange={(e) => setNewRestriction(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newRestriction.description}
                                onChange={(e) => setNewRestriction(prev => ({ ...prev, description: e.target.value }))}
                            />
                            <div className="form-actions">
                                <button className="save-btn" onClick={handleAddRestriction}>
                                    <Save size={16} />
                                    Add
                                </button>
                                <button 
                                    className="cancel-btn" 
                                    onClick={() => {
                                        setShowAddRestriction(false);
                                        setNewRestriction({ name: '', description: '' });
                                    }}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="restrictions-grid">
                        {dietaryRestrictions.map(restriction => (
                            <div key={restriction.id} className="restriction-card">
                                <h4>{restriction.name}</h4>
                                <p>{restriction.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu Items Management */}
                <div className="section">
                    <div className="section-header">
                        <h2>Menu Items Allergen Information</h2>
                    </div>

                    {editingItem && (
                        <div className="editor-overlay">
                            <div className="editor-modal">
                                <AllergenEditor
                                    item={editingItem}
                                    onSave={() => setEditingItem(null)}
                                    onCancel={() => setEditingItem(null)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="menu-items-grid">
                        {menuItems.map(item => (
                            <div key={item.id} className="menu-item-card">
                                <div className="item-header">
                                    <h3>{item.name}</h3>
                                    <button 
                                        className="edit-btn"
                                        onClick={() => setEditingItem(item)}
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                </div>
                                
                                <div className="item-info">
                                    <div className="allergens-section">
                                        <h5>Allergens:</h5>
                                        <div className="allergen-list">
                                            {item.allergens && item.allergens.length > 0 ? (
                                                item.allergens.map(allergen => (
                                                    <span key={allergen} className="allergen-badge">
                                                        {allergen}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="no-data">No allergens listed</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="restrictions-section">
                                        <h5>Dietary Restrictions:</h5>
                                        <div className="restriction-list">
                                            {item.dietary_restrictions && item.dietary_restrictions.length > 0 ? (
                                                item.dietary_restrictions.map(restriction => (
                                                    <span key={restriction} className="restriction-badge">
                                                        {restriction}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="no-data">No restrictions listed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllergenManagement;