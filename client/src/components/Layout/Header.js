import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message, Dropdown, Menu, Button, Modal, Input, Rate, Form, Upload } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';

const Header = () => {
  const [loginUser, setLoginUser] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null); // Profile picture state
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setLoginUser(user);
      setNewName(user.name);
      setNewEmail(user.email);
      setNewProfilePic(user.profilePic || null); // Load the profile picture if available
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('user');
    message.success('Logout successful');
    navigate('/login');
  };

  const handleMenuClick = (e) => {
    if (e.key === 'edit') {
      setIsEditing(true);
    } else if (e.key === 'logout') {
      logoutHandler();
    } else if (e.key === 'rate') {
      setIsRating(true);
    }
  };

  const handleEditSave = () => {
    const updatedUser = { ...loginUser, name: newName, email: newEmail, profilePic: newProfilePic };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setLoginUser(updatedUser);
    setIsEditing(false);
    message.success('Profile updated successfully');
  };

  const handleRateSubmit = () => {
    message.success('Thank you for your feedback!');
    setIsRating(false); // Close modal
  };

  const profileMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="edit">Edit Profile</Menu.Item>
      <Menu.Item key="rate">Rate the App</Menu.Item>
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  const handleProfilePicChange = (info) => {
    const file = info.file; // Directly access `info.file`

    if (file && file instanceof Blob) { // Ensure the file is a valid Blob
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result; // Get the file as a Data URL (base64)
        setNewProfilePic(fileUrl); // Set the image URL in state

        // Update the user object with the new profile picture
        const updatedUser = { ...loginUser, profilePic: fileUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Update localStorage
        setLoginUser(updatedUser); // Update loginUser state
      };
      reader.readAsDataURL(file); // Read the file as Data URL
    } else {
      message.error("Invalid file type. Please upload a valid image.");
    }
  };



  return (
    <div className="header-container">
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo01"
            aria-controls="navbarTogglerDemo01"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
            <Link className="navbar-brand" to="/">Expense Management</Link>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center">
              <li className="nav-item d-flex align-items-center">
                <Dropdown overlay={profileMenu} trigger={['click']}>
                  <Button className="login-icon">
                    {loginUser && loginUser.profilePic ? (
                      <img
                        src={loginUser.profilePic}
                        alt="Profile"
                        className="login-profile-pic"
                        style={{ borderRadius: '50%', width: '32px', height: '32px' }} // Circular image styling
                      />
                    ) : (
                      <UserOutlined />
                    )}
                  </Button>
                </Dropdown>
                <p className="nav-link ms-2 username-text">{loginUser && loginUser.name}</p>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      <Modal
        title="Edit Profile"
        visible={isEditing}
        onOk={handleEditSave}
        onCancel={() => setIsEditing(false)}
        centered
      >
        {/* Circular Profile Picture */}
        <div className="profile-pic-container">
          <Upload
            showUploadList={false}
            beforeUpload={() => false} // Prevent automatic upload
            onChange={handleProfilePicChange} // Handle file selection and update profile pic
          >
            <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
          </Upload>


        </div>

        {/* Email Field with Icon */}
        <div className="edit-field">
          <MailOutlined className="field-icon" />
          <Input
            placeholder="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            suffix={<EditOutlined />}
          />
        </div>

        {/* Name Field with Icon */}
        <div className="edit-field" style={{ marginTop: 16 }}>
          <UserOutlined className="field-icon" />
          <Input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            suffix={<EditOutlined />}
          />
        </div>
      </Modal>

      <Modal
        title="Rate the App"
        visible={isRating}
        footer={null}
        onCancel={() => setIsRating(false)}
      >
        <Form layout="vertical" onFinish={handleRateSubmit}>
          <Form.Item label="Rate the App">
            <Rate value={rating} onChange={setRating} />
          </Form.Item>
          <Form.Item label="Feedback" required>
            <Input.TextArea
              rows={4}
              placeholder="Share your thoughts, improvements, or issues here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Header;
