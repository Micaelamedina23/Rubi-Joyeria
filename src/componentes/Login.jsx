import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import "../css/Login.css";

const Login = ({ setUserRole }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert(data.message);
                
                // Guardar los datos del usuario en localStorage
                localStorage.setItem("userRole", data.userRole.toString()); // Guardar rol
                localStorage.setItem("userId", data.userId); // Guardar ID del usuario
                localStorage.setItem("userName", data.userName); // Guardar nombre del usuario
    
                setUserRole(data.userRole); // Actualizar estado en la app
    
                // 🔹 Primero navega a /home
                navigate("/home");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="avatar">
                    <FontAwesomeIcon icon={faUserCircle} size="5x" />
                </div>
                <h2>Iniciar Sesión</h2>
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
            </form>
        </div>
    );
};

export default Login;
