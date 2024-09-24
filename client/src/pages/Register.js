/*import React, { useState, useEffect } from 'react';
import { Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import '../cssFiles/LoginRegister.css';
import '../cssFiles/LandingPage.css';


const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const submitHandler = async (values) => {
        try {
            setLoading(true);
            await axios.post('/api/v1/users/register', values);
            message.success("Registration successful");
            localStorage.setItem('user', JSON.stringify({ ...values, password: '' }));
            setLoading(false);
            navigate("/login");
        } catch (error) {
            setLoading(false);
            message.error("Something went wrong");
        }
    }

  // Prevent logged-in users from accessing the register page
    useEffect(() => {
        if (localStorage.getItem('user')) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <div className='login-page'>
            {loading && <Spinner />}
            <Form layout="vertical" onFinish={submitHandler} className='register-form'>
                <h1 className='register-heading'>Register Form</h1>
                <Form.Item label="Name" name="name">
                    <Input className='login-input'/>
                </Form.Item>
                <Form.Item label="Email" name="email">
                    <Input type='email' className='login-input'/>
                </Form.Item>
                <Form.Item label="Password" name="password">
                    <Input type='password' className='login-input'/>
                </Form.Item>
                <div className='register-footer'>
                    <Link to="/login" className='login-link'>Already Registered? Click here to Login</Link>
                    <button className='btn btn-primary'>Register</button>
                </div>
            </Form>
        </div>
    );
}

export default Register;*/
import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import axios from 'axios';
import Spinner from '../components/Spinner';
import '../cssFiles/LoginRegister.css';
import { Link } from 'react-router-dom'; 
const Register = () => {
    const [loading, setLoading] = useState(false);

    const submitHandler = async (values) => {
        try {
            setLoading(true);
            await axios.post('/api/v1/users/register', values);
            message.success("Registration successful");
            localStorage.setItem('user', JSON.stringify({ ...values, password: '' }));
            setLoading(false);
            window.location.href = '/login'; // Redirect to login after successful registration
        } catch (error) {
            setLoading(false);
            message.error("Something went wrong");
        }
    };

    return (
        <div className='register-page'>
        <Form layout="vertical" onFinish={submitHandler} className='register-form'>
            <h1 className='register-heading'>Register Form</h1>
            <Form.Item label="Name" name="name">
                <Input className='login-input'/>
            </Form.Item>
            <Form.Item label="Email" name="email">
                <Input type='email' className='login-input'/>
            </Form.Item>
            <Form.Item label="Password" name="password">
                <Input type='password' className='login-input'/>
            </Form.Item>
            <div className='register-footer'>
                <Link to="/reset-password" className='forgot-password-link'>Forgot Password?</Link>
                <button className='btn btn-primary'>Register</button>
            </div>
            <div className='login-link'>
                <Link to="/login" className='login-link'>Already Registered? Click here to Login</Link>
            </div>    
        </Form>
        </div>
    );
};

export default Register;

