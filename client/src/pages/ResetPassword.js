import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../cssFiles/resetPswd.css';

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleEmailSubmit = async (values) => {
        try {
            setLoading(true);
            const { email } = values;
            setEmail(email);
            const response = await axios.post('/api/v1/users/check-email', { email });

            if (response.data.exists) {
                message.success('Email found. Please set a new password.');
                setStep(2);
            } else {
                message.error('Email not found. Redirecting to register page...');
                setTimeout(() => {
                    navigate('/register');
                }, 3000);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error('Something went wrong');
        }
    };

    const handlePasswordReset = async (values) => {
        try {
            setLoading(true);
            const { newPassword, confirmPassword } = values;

            if (newPassword !== confirmPassword) {
                message.error('Passwords do not match');
                setLoading(false);
                return;
            }
            await axios.post('/api/v1/users/reset-password/confirm', { email, newPassword });
            setLoading(false);
            message.success('Password changed successfully');
            navigate('/login');
        } catch (error) {
            setLoading(false);
            message.error('Something went wrong');
        }
    };

    return (
        <div className="reset-password-page">
            {step === 1 && (
                <Form layout="vertical" onFinish={handleEmailSubmit}>
                    <h1>Reset Password</h1>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please enter your email' }]}
                    >
                        <Input type="email" />
                    </Form.Item>
                    <div className="link-container">
                        <div className='links'>
                            <span onClick={() => navigate('/login')} className="link">Login</span>
                            <span onClick={() => navigate('/register')} className="link">Register</span>
                        </div>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Checking...' : 'Next'}
                        </button>
                    </div>
                </Form>
            )}
            {step === 2 && (
                <Form layout="vertical" onFinish={handlePasswordReset}>
                    <h1>Set New Password</h1>
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[{ required: true, message: 'Please enter your new password' }]}
                    >
                        <Input type="password" />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Please confirm your password' }]}
                    >
                        <Input type="password" />
                    </Form.Item>
                    <div className="link-container">
                        <div className='links'>
                            <span onClick={() => navigate('/login')} className="link">Login</span>
                            <span onClick={() => navigate('/register')} className="link">Register</span>
                        </div>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </Form>
            )}
        </div>
    );
};

export default ResetPassword;
