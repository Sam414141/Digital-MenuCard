import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useApiUrl from '../hooks/useApiUrl';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    Edit, 
    Save, 
    X, 
    Shield, 
    Heart,
    Settings,
    AlertCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import './UserProfile.css';
import axios from 'axios';

const UserProfile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const { buildUrl } = useApiUrl();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Profile form state
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Preferences state
    const [preferences, setPreferences] = useState({
        spiceLevel: 'medium',
        cuisineTypes: [],
        defaultTableSize: 2,
        specialInstructions: '',
        notifications: {
            email: true,
            sms: false,
            push: true
        }
    });
    
    // Dietary restrictions state
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [availableRestrictions, setAvailableRestrictions] = useState([]);
    const [userRestrictions, setUserRestrictions] = useState([]);

    // Initialize form data when user data is available
    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
            });
            
            if (user.preferences) {
                setPreferences({
                    spiceLevel: user.preferences.spiceLevel || 'medium',
                    cuisineTypes: user.preferences.cuisineTypes || [],
                    defaultTableSize: user.preferences.defaultTableSize || 2,
                    specialInstructions: user.preferences.specialInstructions || '',
                    notifications: user.preferences.notifications || {
                        email: true,
                        sms: false,
                        push: true
                    }
                });
            }
            
            setUserRestrictions(user.dietaryRestrictions || []);
        }
    }, [user]);

    // Fetch dietary restrictions
    useEffect(() => {
        fetchDietaryRestrictions();
    }, []);

    const fetchDietaryRestrictions = async () => {
        try {
            const response = await axios.get(buildUrl('/api/users/dietary-restrictions'));
            if (response.data.status === 'success') {
                setAvailableRestrictions(response.data.data.dietaryRestrictions);
            }
        } catch (error) {
            console.error('Failed to fetch dietary restrictions:', error);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const result = await updateProfile(profileForm);
            if (result.success) {
                setIsEditingProfile(false);
                showMessage('success', 'Profile updated successfully!');
            } else {
                showMessage('error', result.error || 'Failed to update profile');
            }
        } catch (error) {
            showMessage('error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage('error', 'New passwords do not match');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            if (result.success) {
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                showMessage('success', 'Password changed successfully!');
            } else {
                showMessage('error', result.error || 'Failed to change password');
            }
        } catch (error) {
            showMessage('error', 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.put(buildUrl('/api/users/preferences'), preferences);
            if (response.data.status === 'success') {
                showMessage('success', 'Preferences updated successfully!');
            } else {
                showMessage('error', 'Failed to update preferences');
            }
        } catch (error) {
            showMessage('error', 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleDietaryRestrictionsSubmit = async () => {
        setLoading(true);
        
        try {
            const restrictionIds = userRestrictions.map(name => {
                const restriction = availableRestrictions.find(r => r.name === name);
                return restriction ? restriction.id : null;
            }).filter(id => id !== null);
            
            const response = await axios.put(buildUrl('/api/users/dietary-restrictions'), {
                restrictionIds
            });
            
            if (response.data.status === 'success') {
                showMessage('success', 'Dietary restrictions updated successfully!');
            } else {
                showMessage('error', 'Failed to update dietary restrictions');
            }
        } catch (error) {
            showMessage('error', 'Failed to update dietary restrictions');
        } finally {
            setLoading(false);
        }
    };

    const toggleDietaryRestriction = (restrictionName) => {
        setUserRestrictions(prev => 
            prev.includes(restrictionName)
                ? prev.filter(r => r !== restrictionName)
                : [...prev, restrictionName]
        );
    };

    const renderProfileTab = () => (
        <div className="profile-section">
            <div className="section-header">
                <h3>Personal Information</h3>
                <button 
                    className="edit-btn"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                    {isEditingProfile ? <X size={20} /> : <Edit size={20} />}
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>First Name</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                value={profileForm.firstName}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                                disabled={!isEditingProfile}
                                required
                                placeholder="Enter first name"
                                className="profile-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Last Name</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                value={profileForm.lastName}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                                disabled={!isEditingProfile}
                                required
                                placeholder="Enter last name"
                                className="profile-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="disabled profile-input"
                                placeholder="Enter email address"
                            />
                        </div>
                        <small className="form-note">Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <div className="input-wrapper">
                            <Phone className="input-icon" size={20} />
                            <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                disabled={!isEditingProfile}
                                placeholder="(123) 456-7890"
                                className="profile-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>
                        <div className="input-wrapper">
                            <Calendar className="input-icon" size={20} />
                            <input
                                type="date"
                                value={profileForm.dateOfBirth}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                disabled={!isEditingProfile}
                                className="profile-input"
                            />
                        </div>
                    </div>
                </div>

                {isEditingProfile && (
                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? <Loader className="spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
        </div>
    );

    const renderPreferencesTab = () => (
        <div className="preferences-section">
            <div className="section-header">
                <h3>Dining Preferences</h3>
            </div>

            <form onSubmit={handlePreferencesSubmit} className="preferences-form">
                <div className="form-group">
                    <label>Preferred Spice Level</label>
                    <select
                        value={preferences.spiceLevel}
                        onChange={(e) => setPreferences(prev => ({ ...prev, spiceLevel: e.target.value }))}
                    >
                        <option value="none">No Spice</option>
                        <option value="mild">Mild</option>
                        <option value="medium">Medium</option>
                        <option value="hot">Hot</option>
                        <option value="extra-hot">Extra Hot</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Default Table Size</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={preferences.defaultTableSize}
                        onChange={(e) => setPreferences(prev => ({ ...prev, defaultTableSize: parseInt(e.target.value) }))}
                    />
                </div>

                <div className="form-group">
                    <label>Special Instructions</label>
                    <textarea
                        value={preferences.specialInstructions}
                        onChange={(e) => setPreferences(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        placeholder="Any special dietary needs or preferences..."
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label>Notification Preferences</label>
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={preferences.notifications.email}
                                onChange={(e) => setPreferences(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, email: e.target.checked }
                                }))}
                            />
                            Email notifications
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={preferences.notifications.sms}
                                onChange={(e) => setPreferences(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, sms: e.target.checked }
                                }))}
                            />
                            SMS notifications
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={preferences.notifications.push}
                                onChange={(e) => setPreferences(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, push: e.target.checked }
                                }))}
                            />
                            Push notifications
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? <Loader className="spin" size={20} /> : <Save size={20} />}
                        Save Preferences
                    </button>
                </div>
            </form>

            <div className="dietary-restrictions">
                <h4>Dietary Restrictions</h4>
                <div className="restrictions-grid">
                    {availableRestrictions.map(restriction => (
                        <label key={restriction.id} className="restriction-item">
                            <input
                                type="checkbox"
                                checked={userRestrictions.includes(restriction.name)}
                                onChange={() => toggleDietaryRestriction(restriction.name)}
                            />
                            <span>{restriction.name}</span>
                            <small>{restriction.description}</small>
                        </label>
                    ))}
                </div>
                <button 
                    type="button" 
                    className="save-btn"
                    onClick={handleDietaryRestrictionsSubmit}
                    disabled={loading}
                >
                    {loading ? <Loader className="spin" size={20} /> : <Save size={20} />}
                    Save Dietary Restrictions
                </button>
            </div>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="security-section">
            <div className="section-header">
                <h3>Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                        <Shield className="input-icon" size={20} />
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <div className="input-wrapper">
                        <Shield className="input-icon" size={20} />
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                        <Shield className="input-icon" size={20} />
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? <Loader className="spin" size={20} /> : <Save size={20} />}
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="user-profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <User size={48} />
                        </div>
                        <div className="profile-info">
                            <h1>{user?.firstName} {user?.lastName}</h1>
                            <p>{user?.email}</p>
                            <span className="join-date">
                                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div className="profile-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={20} />
                            Profile
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preferences')}
                        >
                            <Settings size={20} />
                            Preferences
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Shield size={20} />
                            Security
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'profile' && renderProfileTab()}
                        {activeTab === 'preferences' && renderPreferencesTab()}
                        {activeTab === 'security' && renderSecurityTab()}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserProfile;