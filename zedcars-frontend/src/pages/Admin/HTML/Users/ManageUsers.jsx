import React, { useState, useEffect } from "react";
import apiClient from "../../../../api/apiClient";
import ConfirmModal from "../../../../components/ConfirmModal";
import Toast from "../../../../components/Toast";
import "../../CSS/ManageUsers.css";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchTerm = "", role = "", page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (role) params.append('role', role);
      params.append('page', page);
      params.append('pageSize', pageSize);
      
      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchUsers(searchTerm, selectedRole, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(searchTerm, selectedRole, page);
  };

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/admin/users/${selectedUserId}`);
      setUsers(users.filter(user => user.adminId !== selectedUserId));
      setShowModal(false);
      setSelectedUserId(null);
      setToast({ show: true, message: 'User deleted successfully', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete user', type: 'error' });
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="manage-users-container">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <ConfirmModal
        show={showModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowModal(false)}
        confirmText="Yes, Delete"
        type="danger"
      />
      
      <div className="header">
        <h2>Manage Users</h2>
        <div className="search-filter-section">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by username or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="role-filter">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Manager">Manager</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
          <button className="apply-filter-btn" onClick={handleApplyFilter}>
            Filter
          </button>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/admin/users/add")}
        >
          Add New User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.adminId}>
                <td>{user.adminId}</td>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.department || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/admin/users/edit/${user.adminId}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteClick(user.adminId)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
        </div>
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
