import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../../api/apiClient";
import Toast from "../../../components/Toast";
import "../CSS/EditAccessories.css";

const EditAccessories = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const accessoryFromState = location.state?.accessory;

  const [accessory, setAccessory] = useState(accessoryFromState || null);
  const [loading, setLoading] = useState(!accessoryFromState);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stockQuantity: "",
    description: "",
    partNumber: "",
    manufacturer: "",
    isActive: true,
  });

  useEffect(() => {
    if (!accessoryFromState) {
      fetchAccessoryDetails();
    } else {
      setFormData(accessoryFromState);
    }
  }, [id]);

  const fetchAccessoryDetails = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await apiClient.get(`/accessory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccessory(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching accessory details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'name' || name === 'category') {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData((prev) => ({ ...prev, [name]: lettersOnly }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.price) <= 0) {
      setToast({ show: true, message: 'Price must be greater than 0', type: 'error' });
      return;
    }
    
    if (parseInt(formData.stockQuantity) < 0) {
      setToast({ show: true, message: 'Stock quantity cannot be negative', type: 'error' });
      return;
    }
    
    try {
      const token = localStorage.getItem("jwtToken");
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
      };

      await apiClient.put(`/accessory/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToast({ show: true, message: 'Accessory updated successfully!', type: 'success' });
      setTimeout(() => navigate("/Admin/ManageAccessories"), 1500);
    } catch (error) {
      console.error("Error updating accessory:", error);
      setToast({ show: true, message: 'Failed to update accessory', type: 'error' });
    }
  };

  if (loading) return <div className="loading">Loading accessory details...</div>;

  return (
    <div className="edit-accessory-container">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="page-header">
        <h1>Edit Accessory</h1>
        <button className="btn-back" onClick={() => navigate("/Admin/ManageAccessories")}>
          ← Back
        </button>
      </div>

      <form className="edit-accessory-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Part Number</label>
            <input
              type="text"
              name="partNumber"
              value={formData.partNumber || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description || ""}
            onChange={handleInputChange}
            style={{color:"black"}}
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/Admin/ManageAccessories")}>
            Cancel
          </button>
          <button type="submit" className="btn-save">Update Accessory</button>
        </div>
      </form>
    </div>
  );
};

export default EditAccessories;
