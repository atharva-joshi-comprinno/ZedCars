import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../api/apiClient";
import Toast from "../../../../components/Toast";
import "../../CSS/UserForm.css";

const DeleteUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      setUser(response.data);
    } catch (err) {
      setToast({ show: true, message: 'Failed to load user data', type: 'error' });
      setTimeout(() => navigate("/admin/users"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/users/${id}`);
      setToast({ show: true, message: 'User deleted successfully', type: 'success' });
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || 'Failed to delete user', type: 'error' });
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading">Loading user data...</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="user-form-container">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="form-header">
        <h2>Delete User</h2>
        <button 
          className="back-btn"
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </button>
      </div>

      <div className="user-form">
        <div className="delete-warning">
          <h3>⚠️ Warning</h3>
          <p>You are about to permanently delete the following user:</p>
        </div>

        <div className="user-details">
          <div className="detail-row">
            <strong>Username:</strong> {user.username}
          </div>
          <div className="detail-row">
            <strong>Full Name:</strong> {user.fullName}
          </div>
          <div className="detail-row">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="detail-row">
            <strong>Role:</strong> {user.role}
          </div>
          <div className="detail-row">
            <strong>Department:</strong> {user.department || 'N/A'}
          </div>
        </div>

        <div className="delete-confirmation">
          <p><strong>This action cannot be undone!</strong></p>
          <p>Are you sure you want to delete this user?</p>
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
            onClick={handleDelete}
            disabled={deleting}
            className="delete-btn"
          >
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;
