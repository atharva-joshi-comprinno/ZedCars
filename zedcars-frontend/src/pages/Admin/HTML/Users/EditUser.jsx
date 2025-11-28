import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../api/apiClient";
import Toast from "../../../../components/Toast";
import "../../CSS/UserForm.css";

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    department: "",
    role: "Customer",
    phoneNumber: "",
    address: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      setFormData({
        ...response.data,
        password: ""
      });
    } catch (err) {
      setToast({ show: true, message: 'Failed to load user data', type: 'error' });
      setTimeout(() => navigate("/admin/users"), 2000);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'fullName') {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: lettersOnly }));
    } else if (name === 'phoneNumber') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numbersOnly }));
    } else if (name === 'username') {
      const alphanumeric = value.replace(/[^a-zA-Z0-9_]/g, '');
      setFormData(prev => ({ ...prev, [name]: alphanumeric }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = "Full name can only contain letters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    
    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = { 
        ...formData,
        adminId: parseInt(id)
      };
      
      if (!updateData.password || !updateData.password.trim()) {
        updateData.password = "KEEP_EXISTING_PASSWORD";
      }
      
      await apiClient.put(`/admin/users/${id}`, updateData);
      setToast({ show: true, message: 'User updated successfully!', type: 'success' });
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      console.error('Update error:', err.response?.data);
      setToast({ show: true, message: err.response?.data?.message || 'Failed to update user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading">Loading user data...</div>;

  return (
    <div className="user-form-container">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="form-header">
        <h2>Edit User</h2>
        <button 
          className="back-btn"
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </button>
      </div>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              maxLength="20"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password or leave blank"
            />
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'error' : ''}
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
            {errors.role && <span className="error-text">{errors.role}</span>}
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              placeholder="10 digits"
              maxLength="10"
              className={errors.phoneNumber ? 'error' : ''}
            />
            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active User
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/admin/users")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
