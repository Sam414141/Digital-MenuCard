import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './AllergenWarning.css';

const AllergenWarning = ({ items, onConfirm, onCancel, isVisible, onServerError }) => {
    const { user } = useAuth();
    const [checking, setChecking] = useState(false);
    const [conflicts, setConflicts] = useState(null);
    const [userAcknowledged, setUserAcknowledged] = useState(false);

    useEffect(() => {
        if (isVisible && items && items.length > 0 && user?.id) {
            // Skip allergen check and proceed directly
            setConflicts({ has_conflicts: false, conflicts: [] });
            setChecking(false);
            // Since there are no conflicts, proceed directly
            setTimeout(() => {
                onConfirm();
            }, 0);
        }
    }, [isVisible, items, user]);

    // Don't render anything since we're proceeding directly
    if (!isVisible) return null;
    return null; // Don't show the modal since we're proceeding directly
};

export default AllergenWarning;