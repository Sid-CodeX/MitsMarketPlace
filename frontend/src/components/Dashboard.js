import React, { useState } from 'react';
import './Dashboard.css';
import { FaEdit } from 'react-icons/fa'; // Importing an edit icon from react-icons

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('buy');
    const [cartItems, setCartItems] = useState([]);
    const [sellingProducts, setSellingProducts] = useState([]);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'student', // 'student' or 'faculty'
        department: '',
        year: '', // '1st year', '2nd year', etc.
    });
    const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150'); // Placeholder image for the profile
    const [profileUpdated, setProfileUpdated] = useState(false); // State for showing success message

    const [sellData, setSellData] = useState({ productName: '', category: '', price: '', image: '', description: '', contactNumber: '' });

    const products = [
        { id: 1, name: 'Product 1', price: 100, description: 'This is a description for Product 1.', imageUrl: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Product 2', price: 150, description: 'This is a description for Product 2.', imageUrl: 'https://via.placeholder.com/150' },
    ];

    const addToCart = (product) => setCartItems([...cartItems, product]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleSellChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files && files.length > 0) {
            setSellData({ ...sellData, image: URL.createObjectURL(files[0]) });
        } else {
            setSellData({ ...sellData, [name]: value });
        }
    };

    const handleSellSubmit = (e) => {
        e.preventDefault();
        setSellingProducts([...sellingProducts, { name: sellData.productName, status: 'Pending' }]);
        setSellData({ productName: '', category: '', price: '', image: '', description: '', contactNumber: '' });
    };

    const handleSectionChange = (section) => setActiveSection(section);

    const clearCart = () => setCartItems([]);

    const handleProfileImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setProfileUpdated(true); // Show success message
        setTimeout(() => setProfileUpdated(false), 3000); // Hide the message after 3 seconds
    };

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <button className={activeSection === 'buy' ? 'active' : ''} onClick={() => handleSectionChange('buy')}>Buy</button>
                <button className={activeSection === 'sell' ? 'active' : ''} onClick={() => handleSectionChange('sell')}>Sell</button>
                <button className={activeSection === 'cart' ? 'active' : ''} onClick={() => handleSectionChange('cart')}>Cart</button>
                <button className={activeSection === 'status' ? 'active' : ''} onClick={() => handleSectionChange('status')}>Status</button>
                <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => handleSectionChange('profile')}>Profile</button>
            </div>

            <div className="page-design">
                <div className="content-section">
                    {activeSection === 'buy' && (
                        <div>
                            <h2>Buy Section</h2>
                            <p>Here are some products available to buy.</p>
                            <div className="product-grid">
                                {products.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <img src={product.imageUrl} alt={product.name} />
                                        <h3>{product.name}</h3>
                                        <p>Price: ${product.price}</p>
                                        <p>{product.description}</p>
                                        <button onClick={() => addToCart(product)}>Add to Cart</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeSection === 'sell' && (
                        <div className="sell-section">
                            <h2>Sell Section</h2>
                            <p>Fill in the details below to sell your product.</p>
                            <form onSubmit={handleSellSubmit}>
                                <div className="input-row">
                                    <div>
                                        <label>Product Name:</label>
                                        <input 
                                            type="text" 
                                            name="productName" 
                                            value={sellData.productName} 
                                            onChange={handleSellChange} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label>Category:</label>
                                        <select 
                                            name="category" 
                                            value={sellData.category} 
                                            onChange={handleSellChange} 
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            <option value="books">Books</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="clothing">Clothing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-row">
                                    <div>
                                        <label>Price:</label>
                                        <input 
                                            type="number" 
                                            name="price" 
                                            value={sellData.price} 
                                            onChange={handleSellChange} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label>Image:</label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            name="image"
                                            onChange={handleSellChange} 
                                            required 
                                        />
                                        {sellData.image && (
                                            <img src={sellData.image} alt="Product Preview" style={{ marginTop: '10px', width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                                        )}
                                    </div>
                                </div>
                                <div className="input-row">
                                    <div>
                                        <label>Description:</label>
                                        <textarea 
                                            name="description" 
                                            value={sellData.description} 
                                            onChange={handleSellChange} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label>Contact Number:</label>
                                        <input 
                                            type="tel" 
                                            name="contactNumber" 
                                            value={sellData.contactNumber} 
                                            onChange={handleSellChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <button type="submit">Sell</button>
                            </form>
                        </div>
                    )}

                    {activeSection === 'cart' && (
                        <div>
                            <h2>Cart Section</h2>
                            {cartItems.length > 0 ? (
                                <ul>
                                    {cartItems.map((item, index) => (
                                        <li key={index}>
                                            {item.name} - ${item.price}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Your cart is empty.</p>
                            )}
                            {cartItems.length > 0 && (
                                <button onClick={clearCart}>Clear Cart</button>
                            )}
                        </div>
                    )}
                    {activeSection === 'status' && (
                        <div>
                            <h2>Status Section</h2>
                            <ul>
                                {sellingProducts.map((product, index) => (
                                    <li key={index}>
                                        {product.name} - {product.status}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeSection === 'profile' && (
                        <div className="profile-section">
                            <h2>Profile Section</h2>
                            <div className="profile-header">
                                {profileImage && (
                                    <img src={profileImage} alt="Profile" className="profile-image" />
                                )}
                                <label className="upload-label">
                                    Upload Photo
                                    <input type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
                                </label>
                                <FaEdit className="edit-icon" onClick={() => alert('Edit profile clicked!')} />
                            </div>
                            <form onSubmit={handleProfileSubmit}>
                                <div>
                                    <label>Name:</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={profileData.name} 
                                        onChange={handleProfileChange} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={profileData.email} 
                                        onChange={handleProfileChange} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label>Phone:</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={profileData.phone} 
                                        onChange={handleProfileChange} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label>Role:</label>
                                    <select 
                                        name="role" 
                                        value={profileData.role} 
                                        onChange={handleProfileChange} 
                                        required
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                    </select>
                                </div>
                                {profileData.role === 'student' && (
                                    <div>
                                        <label>Year:</label>
                                        <select 
                                            name="year" 
                                            value={profileData.year} 
                                            onChange={handleProfileChange} 
                                            required
                                        >
                                            <option value="">Select your year</option>
                                            <option value="1st year">1st year</option>
                                            <option value="2nd year">2nd year</option>
                                            <option value="3rd year">3rd year</option>
                                            <option value="4th year">4th year</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label>Department:</label>
                                    <select                                             name="department" 
                                        value={profileData.department} 
                                        onChange={handleProfileChange} 
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="CSE">CSE</option>
                                        <option value="CSE-AI">CSE-AI</option>
                                        <option value="CSE-CY">CSE-CY</option>
                                        <option value="AIDS">AIDS</option>
                                        <option value="ECE">ECE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="ME">ME</option>
                                        <option value="CE">CE</option>
                                        <option value="MCA">MCA</option>
                                    </select>
                                </div>
                                <button type="submit">Update Profile</button>
                            </form>
                            {profileUpdated && <p className="success-message">Profile updated successfully!</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
