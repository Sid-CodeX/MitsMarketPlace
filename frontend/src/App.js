
/*import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
    return (
        <Router>
            <Routes>
            <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Login />} /> {/* Redirect to Login by default /}
            </Routes>
        </Router>
    );
};

export default App;
*/
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

const App = () => {
    return (
        <Router>
            <Routes>
            <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/marketplace" element={<Dashboard />} /> {/* New Dashboard Route */}
                <Route path="/" element={<Login />} /> {/* Redirect to Login by default */}
            </Routes>
        </Router>
    );
};

export default App;


