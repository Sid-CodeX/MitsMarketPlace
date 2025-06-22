import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This imports the default styles
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './components/ThemeContext'; // Import the ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider>  {/* Wrap App with ThemeProvider */}
            <App />
        </ThemeProvider>
    </React.StrictMode>
);

reportWebVitals();
