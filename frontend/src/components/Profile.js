import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profileUpdated, setProfileUpdated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for dropdowns
    const roles = ['student', 'faculty'];
    const departments = ['CSE', 'CSE-AI', 'CSE-CY', 'AI-DS', 'ECE', 'EEE', 'ME', 'CE', 'MCA'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    // Default avatar image
    const defaultAvatar = 'https://m.media-amazon.com/images/I/41jLBhDISxL.jpg';
    // Profile.js
    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('User not authenticated.');
                setLoading(false);
                return;
            }

            const source = axios.CancelToken.source();

            try {
                const response = await axios.get('http://localhost:5000/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                    cancelToken: source.token,
                });
                
                setProfileData(response.data);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Fetch canceled:', error.message);
                } else {
                    console.error('Error fetching profile:', error);
                    setError('Failed to load profile data.');
                }
            } finally {
                setLoading(false);
            }

            return () => source.cancel('Request canceled on component unmount');
        };

        fetchProfileData();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', profileData.name || '');
        formData.append('email', profileData.email || '');
        formData.append('phone', profileData.phone || '');
        formData.append('role', profileData.role?.toLowerCase() || '');
        formData.append('department', profileData.department || '');
        if (profileData.role === 'student') {
            formData.append('year', profileData.year || '');
        }
    
        try {
            await axios.put('http://localhost:5000/api/profile', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            setProfileUpdated(true);
            setIsEditing(false);
            setTimeout(() => setProfileUpdated(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Profile update failed: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="profile-section">
            <h2>Profile Section</h2>
            <div className="profile-header">
                <img src={defaultAvatar} alt="Profile" className="profile-image" />
                <FaEdit 
                    className="edit-icon" 
                    onClick={() => setIsEditing(!isEditing)} 
                    title="Edit Profile" 
                />
            </div>
            {isEditing ? (
                <form onSubmit={handleProfileSubmit}>
                    {/* Form fields for editing profile */}
                    <div>
                        <label>Name:</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={profileData.name || ''} 
                            onChange={handleProfileChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={profileData.email || ''} 
                            onChange={handleProfileChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Phone:</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={profileData.phone || ''} 
                            onChange={handleProfileChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Role:</label>
                        <select 
                            name="role" 
                            value={profileData.role || ''} 
                            onChange={handleProfileChange} 
                            required 
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {profileData.role === 'student' && (
                        <div>
                            <label>Year:</label>
                            <select 
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
                    <div>
                        <label>Department:</label>
                        <select 
                            name="department" 
                            value={profileData.department || ''} 
                            onChange={handleProfileChange} 
                            required 
                        >
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Update Profile</button>
                </form>
            ) : (
                <div className="profile-details">
                    <p><strong>Name:</strong> {profileData.name}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Phone:</strong> {profileData.phone}</p>
                    <p><strong>Role:</strong> {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}</p>
                    {profileData.role === 'student' && <p><strong>Year:</strong> {profileData.year}</p>}
                    <p><strong>Department:</strong> {profileData.department}</p>
                </div>
            )}
            {profileUpdated && <p className="success-message">Profile updated successfully!</p>}
        </div>
    );
};

export default Profile;
