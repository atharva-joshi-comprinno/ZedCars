import React, { useState, useEffect } from "react";
import apiClient from "../../../api/apiClient";
import { getFirstImageUrl } from "../../../utils/imageUtils";
import "../../Home/CSS/HomeInventory.css";
import { useNavigate } from "react-router-dom";

const HomeInventory = () => {
  const [data, setData] = useState({
    cars: [],
    brands: [],
    fuelTypes: [],
    selectedBrand: "",
    selectedPriceRange: "",
    selectedFuelType: "",
    currentPage: 1,
    totalPages: 1,
    pageSize: 6,
    totalCars: 0,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const {
    cars,
    brands,
    fuelTypes,
    selectedBrand,
    selectedPriceRange,
    selectedFuelType,
    currentPage,
    totalPages,
    pageSize,
    totalCars,
  } = data;

  const fetchInventoryData = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        brand: filters.brand || "",
        priceRange: filters.priceRange || "",
        fuelType: filters.fuelType || "",
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await apiClient.get(`/home/inventory?${params}`);
      setData({
        cars: response.data.cars || [],
        brands: response.data.brands || [],
        fuelTypes: response.data.fuelTypes || [],
        selectedBrand: response.data.selectedBrand || "",
        selectedPriceRange: response.data.selectedPriceRange || "",
        selectedFuelType: response.data.selectedFuelType || "",
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        pageSize: response.data.pageSize || 6,
        totalCars: response.data.totalCars || 0,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const filters = {
      brand: formData.get("brand") || "",
      priceRange: formData.get("priceRange") || "",
      fuelType: formData.get("fuelType") || "",
    };
    fetchInventoryData(1, filters);
  };

  const handlePageChange = (page) => {
    fetchInventoryData(page, {
      brand: selectedBrand,
      priceRange: selectedPriceRange,
      fuelType: selectedFuelType,
    });
  };

  if (loading) {
    return <div className="home-inv-loading">Loading inventory...</div>;
  }

  return (
    <div className="home-inv-container">
      <header className="home-inv-header">
        <h1 className="home-inv-title">Vehicle Inventory</h1>
        <p className="home-inv-subtitle">Browse our selection of quality vehicles</p>
      </header>

      <form className="home-inv-filters" onSubmit={handleFilterSubmit}>
        <select name="brand" className="home-inv-select" defaultValue={selectedBrand}>
          <option value="">All Brands</option>
          {brands.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>

        <select name="priceRange" className="home-inv-select" defaultValue={selectedPriceRange}>
          <option value="">All Prices</option>
          <option value="0-20000">$0 - $20,000</option>
          <option value="20001-30000">$20,001 - $30,000</option>
          <option value="30001-40000">$30,001 - $40,000</option>
          <option value="40001-50000">$40,001 - $50,000</option>
          <option value="50001-60000">$50,001 - $60,000</option>
        </select>

        <select name="fuelType" className="home-inv-select" defaultValue={selectedFuelType}>
          <option value="">All Fuel Types</option>
          {fuelTypes.map((f, i) => (
            <option key={i} value={f}>{f}</option>
          ))}
        </select>

        <button type="submit" className="home-inv-filter-btn">Apply Filters</button>
      </form>

      <div className="home-inv-grid">
        {cars.length > 0 ? (
          cars.map((car) => (
            <article
              className="home-inv-card"
              key={car.id}
              onClick={() => navigate(`/vehicle/${car.carId || car.id}`)}
            >
              <div className="home-inv-img-wrapper">
                <img
                  src={getFirstImageUrl(car.imageUrl) || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={`${car.make} ${car.model}`}
                  className="home-inv-img"
                />
                {car.stockQuantity <= 0 && (
                  <div className="home-inv-out-of-stock">Out of Stock</div>
                )}
              </div>
              
              <div className="home-inv-content">
                <h3 className="home-inv-car-name">{car.make} {car.model}</h3>
                {car.year && <p className="home-inv-year">{car.year}</p>}

                <div className="home-inv-specs">
                  {car.fuelType && <span className="home-inv-badge">{car.fuelType}</span>}
                  {car.transmission && <span className="home-inv-badge">{car.transmission}</span>}
                  {car.mileage && <span className="home-inv-badge">{car.mileage.toLocaleString()} mi</span>}
                </div>

                <div className="home-inv-footer">
                  <span className="home-inv-price">${car.price?.toLocaleString()}</span>
                  <span className="home-inv-stock">Stock: {car.stockQuantity}</span>
                </div>

                <button 
                  className="home-inv-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/vehicle/${car.carId || car.id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="home-inv-empty">
            <h3>No vehicles available</h3>
            <p>Please check back later for new inventory.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="home-inv-pagination-wrapper">
          <nav className="home-inv-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="home-inv-page-btn"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`home-inv-page-btn ${i + 1 === currentPage ? "home-inv-active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="home-inv-page-btn"
            >
              Next
            </button>
          </nav>

          <p className="home-inv-page-info">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCars)} of {totalCars} vehicles
          </p>
        </div>
      )}
    </div>
  );
};

export default HomeInventory;
