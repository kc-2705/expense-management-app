import React, { useState } from 'react';
import '../cssFiles/LandingPage.css';
import Login from './Login'; // Import the login component
import Register from './Register'; // Import the register component
import Img1 from '../cssFiles/scr1.jpg';
import Img2 from '../cssFiles/scr2.jpg'
import Img3 from '../cssFiles/scr3.jpg';

const LandingPage = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const toggleLogin = () => {
        setShowLogin(!showLogin);
        setShowRegister(false); // Hide register if login is shown
    };

    const toggleRegister = () => {
        setShowRegister(!showRegister);
        setShowLogin(false); // Hide login if register is shown
    };

    return (
        <div className={`landing-page ${showLogin || showRegister ? 'blur-background' : ''}`}>
            <header className="header">
                <div className="search-bar">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <button className="btn btn-search">🔍</button>
                </div>
                <div className="auth-buttons">
                    <button className="btn btn-login" onClick={toggleLogin}>Login</button>
                    <button className="btn btn-register" onClick={toggleRegister}>Register</button>
                </div>
            </header>

            <div className="main-content">
                <div className="intro-section">
                    <div className="text-section">
                        <div className='heading'>
                            <h1 className='title'>Expense<br /> Management <br />Software</h1>
                            <p className='feature-description'>Effortlessly manage your finances and track your expenses.</p>
                        </div>
                        <div className="features">
                            <div className="feature">
                                <div className="text-container">
                                    <h1>Expense Tracking</h1>
                                    <p className="feature-description">Easily track daily, weekly, and monthly expenses by categorizing
                                        transactions. Users can input expenses, view historical data, and stay on top of their
                                        financial habits, ensuring they never miss a transaction.</p>
                                </div>
                                <img src={Img1} alt="Track Expenses" className="feature-icon" />
                            </div>
                            <div className="feature">
                                <div className="text-container">
                                    <h1>Budget Management</h1>
                                    <p className="feature-description">Set personalized budgets for different categories like
                                        groceries, entertainment, and travel. The app helps users monitor spending limits,
                                        sending alerts when they approach or exceed their budget.</p>
                                </div>
                                <img src={Img2} alt="Analyze Charts" className="feature-icon" />
                            </div>
                            <div className="feature">
                                <div className="text-container">
                                    <h1>Analytics and Visualizations</h1>
                                    <p className="feature-description">Gain insights into spending habits with interactive
                                        charts and graphs. The app displays spending patterns over time, offering a
                                        clear breakdown of expenses across various categories and time periods.</p>
                                </div>
                                <img src={Img3} alt="Reports" className="feature-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(showLogin || showRegister) && (
                <div className="form-container">
                    <div className="form-box">
                        <button className="close-btn" onClick={() => { setShowLogin(false); setShowRegister(false); }}>×</button>
                        {showLogin && <Login />}
                        {showRegister && <Register />}
                    </div>
                </div>
            )}
        </div>
    );



};

export default LandingPage;
