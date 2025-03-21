import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faTruck,
  faBox,
  faWarehouse,
  faShoppingCart,
  faDollarSign,
  faChartLine,
  faCashRegister,
  faFileInvoice,
  faSignOutAlt,
  faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import "../css/Home.css";

const Home = () => {
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="home-container">
      <header className="header">
      <div className="welcome-container">
    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
    <p className="welcome-message">
        Bienvenido, {userName || "Invitado"}
    </p>
</div>
      </header>
      <div className="sidebar">
        <ul className="menu">
          <li>
            <Link to="/proveedores">
              <FontAwesomeIcon icon={faTruck} className="menu-icon" />
              <span>Proveedores</span>
            </Link>
          </li>
          <li>
            <Link to="/productos">
              <FontAwesomeIcon icon={faBox} className="menu-icon" />
              <span>Productos</span>
            </Link>
          </li>
          {userRole === "1" && (
            <li>
              <Link to="/stock">
                <FontAwesomeIcon icon={faWarehouse} className="menu-icon" />
                <span>Stock</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/compras">
              <FontAwesomeIcon icon={faShoppingCart} className="menu-icon" />
              <span>Compras</span>
            </Link>
          </li>
          <li>
            <Link to="/ventas">
              <FontAwesomeIcon icon={faDollarSign} className="menu-icon" />
              <span>Ventas</span>
            </Link>
          </li>
          {userRole === "1" && (
            <>
              <li>
                <Link to="/reportes">
                  <FontAwesomeIcon icon={faChartLine} className="menu-icon" />
                  <span>Reportes</span>
                </Link>
              </li>
              <li>
                <Link to="/caja">
                  <FontAwesomeIcon
                    icon={faCashRegister}
                    className="menu-icon"
                  />
                  <span>Caja</span>
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/facturacion">
              <FontAwesomeIcon icon={faFileInvoice} className="menu-icon" />
              <span>Facturación</span>
            </Link>
          </li>
        </ul>
        <div className="logout-button-container">
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
          </button>
        </div>
      </div>
      <div className="content">{/* Contenido principal */}</div>
    </div>
  );
};

export default Home;
