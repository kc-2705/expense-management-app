/*import React, { useState, useEffect } from 'react';
import { Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import '../cssFiles/LoginRegister.css';
import '../cssFiles/LandingPage.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const submitHandler = async (values) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/v1/users/login', values);
            setLoading(false);
            message.success("Login success");
            localStorage.setItem('user', JSON.stringify({ ...data.user, password: '' }));
            navigate('/home');
        } catch (error) {
            setLoading(false);
            message.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (localStorage.getItem('user')) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <div className='login-page'>
            {loading && <Spinner />}
            <Form layout="vertical" onFinish={submitHandler} className='login-form'>
                <h1 className='login-heading'>Login Form</h1>
                <Form.Item label="Email" name="email">
                    <Input type='email' className='login-input' />
                </Form.Item>
                <Form.Item label="Password" name="password">
                    <Input type='password' className='login-input' />
                </Form.Item>
                <div className='login-footer'>
                    <Link to="/register" className='login-link'>Not a user? Click here to Register</Link>
                    <button type='submit' className='btn btn-primary'>Login</button>
                </div>
            </Form>
        </div>
    );
}

export default Login;*/

import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import axios from 'axios';
import '../cssFiles/LoginRegister.css';
import {Link} from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);

    const submitHandler = async (values) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/v1/users/login', values);
            setLoading(false);
            message.success("Login successful");
            localStorage.setItem('user', JSON.stringify({ ...data.user, password: '' }));
            window.location.href = '/home'; // Navigate to home after login
        } catch (error) {
            setLoading(false);
            message.error("Something went wrong");
        }
    };
    return (
        <div className='login-page'>
            <Form layout="vertical" onFinish={submitHandler} className='login-form'>
                <h1 className='login-heading'>Login Form</h1>
                <Form.Item label="Email" name="email">
                    <Input type='email' className='login-input' />
                </Form.Item>
                <Form.Item label="Password" name="password">
                    <Input type='password' className='login-input' />
                </Form.Item>
                <div className='login-footer'>
                    <Link to="/reset-password" className='forgot-password-link'>Forgot Password?</Link>
                    <button type='submit' className='btn btn-primary'>Login</button>
                </div>
                <div className='register-link'>
                    <Link to="/register" className='register-link'>Already registered? Click here to Login</Link>
                </div>
            </Form>
        </div>
    );
};

export default Login;
