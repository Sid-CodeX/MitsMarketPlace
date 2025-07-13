// src/components/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import '../styles/Profile.css';

// Define the API base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Profile component expects an 'onProfileUpdate' prop from Dashboard
const Profile = ({ onProfileUpdate }) => {
    const { isAuthenticated } = useAuth(); // Get authentication status
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false); // New state for password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [loading, setLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // State for dropdowns (ensure these match your backend enums/options)
    const roles = ['Student', 'Faculty']; // Capitalized for display
    const departments = ['CSE', 'CSE-AI', 'CSE-CY', 'AI-DS', 'ECE', 'EEE', 'ME', 'CE', 'MCA'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    // Default avatar image (use a local path or a more robust CDN if available)
    const defaultAvatar = 'https://i.ibb.co/VtP871T/default-avatar.png'; // Example placeholder image

    // Function to fetch profile data from the backend
    const fetchProfileData = useCallback(async () => {
        if (!isAuthenticated) {
            setProfileError('User not authenticated.');
            setLoading(false);
            setProfileData(null);
            return;
        }

        setLoading(true);
        setProfileError(null); // Clear previous errors
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/profile/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Ensure fetched role matches dropdown capitalization if needed for display
            setProfileData({ ...response.data, role: response.data.role.charAt(0).toUpperCase() + response.data.role.slice(1) });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch profile data on component mount or when auth status changes
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]); // Dependency array to re-fetch when fetchProfileData changes (due to isAuthenticated)


    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess('');

        if (!profileData) {
            setProfileError('No profile data to submit.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: profileData.name,
                phone: profileData.phone,
                department: profileData.department,
                // Send role in lowercase as per backend validation check: check('role').isIn(['student', 'faculty'])
                role: profileData.role?.toLowerCase(),
                profileImage: profileData.profileImage || defaultAvatar, // Send current image or default
            };
            // Only include year if role is student
            if (profileData.role?.toLowerCase() === 'student') {
                payload.year = profileData.year;
            }

            const response = await axios.put(`${API_BASE_URL}/api/profile/update`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // Sending JSON data
                },
            });

            setProfileData({ ...response.data, role: response.data.role.charAt(0).toUpperCase() + response.data.role.slice(1) }); // Update with server response
            setProfileSuccess('Profile updated successfully!');
            setIsEditing(false); // Exit editing mode
            if (onProfileUpdate) {
                onProfileUpdate(); // Notify Dashboard to refresh its profile data
            }
            setTimeout(() => setProfileSuccess(''), 3000); // Clear success message after 3 seconds
        } catch (error) {
            console.error('Error updating profile:', error);
            setProfileError(error.response?.data?.message || 'Profile update failed. Please try again.');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess('');

        if (!currentPassword || !newPassword) {
            setPasswordError('Please fill in both current and new passwords.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/profile/update-password`,
                { currentPassword, newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setPasswordSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setIsUpdatingPassword(false); // Hide password update form
            if (onProfileUpdate) {
                onProfileUpdate(); // Notify Dashboard if it needs to react to password change (e.g., re-login prompt)
            }
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating password:', error);
            setPasswordError(error.response?.data?.message || 'Password update failed. Please try again.');
        }
    };


    if (loading) return <p className="loading-message">Loading profile...</p>;
    if (profileError && !profileData) return <p className="error-message">{profileError}</p>; // Display error if no data could be loaded

    return (
        <div className="profile-section">
            <h2>User Profile</h2>
            <div className="profile-header">
                <img src={profileData?.profileImage || defaultAvatar} alt="Profile" className="profile-image" />
                <FaEdit
                    className="edit-icon"
                    onClick={() => setIsEditing(!isEditing)}
                    title="Edit Basic Profile"
                />
            </div>

            {profileSuccess && <p className="success-message">{profileSuccess}</p>}
            {profileError && <p className="error-message">{profileError}</p>}

            {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={profileData.name || ''}
                            onChange={handleProfileChange}
                            required
                        />
                    </div>
                    {/* Email is read-only as per backend, not updated via /update route */}
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email || ''}
                            readOnly // Email is likely not editable via this route
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone:</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profileData.phone || ''}
                            onChange={handleProfileChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            name="role"
                            value={profileData.role || ''}
                            onChange={handleProfileChange}
                            required
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>
                    {profileData.role?.toLowerCase() === 'student' && ( // Check lowercase for logic
                        <div className="form-group">
                            <label htmlFor="year">Year:</label>
                            <select
                                id="year"
                                name="year"
                                value={profileData.year || ''}
                                onChange={handleProfileChange}
                                required
                            >
                                <option value="">Select Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="department">Department:</label>
                        <select
                            id="department"
                            name="department"
                            value={profileData.department || ''}
                            onChange={handleProfileChange}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="profileImage">Profile Image URL:</label>
                        <input
                            type="url"
                            id="profileImage"
                            name="profileImage"
                            value={profileData.profileImage || ''}
                            onChange={handleProfileChange}
                            placeholder="Enter image URL"
                        />
                    </div>
                    <button type="submit" className="submit-button">Update Profile</button>
                    <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div className="profile-details">
                    <p><strong>Name:</strong> {profileData?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {profileData?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {profileData?.phone || 'N/A'}</p>
                    <p><strong>Role:</strong> {profileData?.role || 'N/A'}</p>
                    {profileData?.role?.toLowerCase() === 'student' && <p><strong>Year:</strong> {profileData?.year || 'N/A'}</p>}
                    <p><strong>Department:</strong> {profileData?.department || 'N/A'}</p>

                    {/* Password Update Section Toggle */}
                    <button
                        className="toggle-password-update"
                        onClick={() => setIsUpdatingPassword(!isUpdatingPassword)}
                    >
                        {isUpdatingPassword ? 'Hide Password Update' : 'Change Password'}
                    </button>
                </div>
            )}

            {/* Password Update Form */}
            {isUpdatingPassword && (
                <form onSubmit={handlePasswordSubmit} className="password-form">
                    <h3>Change Password</h3>
                    {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
                    {passwordError && <p className="error-message">{passwordError}</p>}
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Update Password</button>
                    <button type="button" className="cancel-button" onClick={() => setIsUpdatingPassword(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default Profile;