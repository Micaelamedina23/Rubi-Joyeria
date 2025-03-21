import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../css/Usuarios.css"; 

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(false);
    const [idUsuario, setIdUsuario] = useState(null);
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [rol, setRol] = useState("2");
    const userRole = localStorage.getItem("userRole"); 

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/usuarios");
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!nombre || !correo || !contraseña) {
            alert("Todos los campos son obligatorios");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/register", {
                name: nombre,
                email: correo,
                password: contraseña,
                role: rol,
            });

            alert("Usuario agregado correctamente");
            resetFormulario();
            fetchUsuarios();
        } catch (error) {
            console.error("Error al agregar usuario:", error);
            alert("Error al agregar usuario");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

        try {
            const userRole = localStorage.getItem("userRole") || "2";

            const response = await axios.delete(`http://localhost:5000/api/usuarios/${id}`, {
                headers: {
                    "user-role": userRole,
                    "Content-Type": "application/json",
                },
            });

            alert("Usuario eliminado correctamente");
            fetchUsuarios();
        } catch (error) {
            console.error("Error al eliminar usuario:", error.response ? error.response.data : error);
            alert("Error al eliminar usuario: " + (error.response ? error.response.data.message : ""));
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();

        try {
            const userRole = localStorage.getItem("userRole") || "2";

            let userData = {
                Nombre: nombre,
                Correo: correo,
                IDRol: parseInt(rol, 10),
            };

            if (contraseña.trim() !== "") {
                userData.Contraseña = contraseña;
            }

            await axios.put(`http://localhost:5000/api/usuarios/${idUsuario}`, userData, {
                headers: {
                    "user-role": userRole,
                    "Content-Type": "application/json",
                },
            });

            alert("Usuario actualizado correctamente");
            resetFormulario();
            fetchUsuarios();
        } catch (error) {
            console.error("Error al actualizar usuario:", error.response ? error.response.data : error);
            alert("Error al actualizar usuario");
        }
    };

    const iniciarEdicion = (usuario) => {
        setIdUsuario(usuario.IDUsuario);
        setNombre(usuario.Nombre);
        setCorreo(usuario.Correo);
        setRol(usuario.IDRol.toString());
        setEditando(true);
        setMostrarFormulario(true);
    };

    const resetFormulario = () => {
        setIdUsuario(null);
        setNombre("");
        setCorreo("");
        setContraseña("");
        setRol("2");
        setMostrarFormulario(false);
        setEditando(false);
    };

    return (
        <div id="usuarios-container" className="container mt-4 position-relative">
            <h2>Gestión de Usuarios</h2>
    
            {mostrarFormulario ? (
                <div className="card p-4">
                    <h4>{editando ? "Editar Usuario" : "Agregar Nuevo Usuario"}</h4>
                    <form onSubmit={editando ? handleEditUser : handleAddUser}>
                        <div className="mb-3">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Correo</label>
                            <input
                                type="email"
                                className="form-control"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>
    
                        <div className="mb-3">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                                placeholder={editando ? "Déjalo vacío para mantener la actual" : "Ingresa una contraseña"}
                                required={!editando}
                            />
                        </div>
    
                        <div className="mb-3">
                            <label className="form-label">Rol</label>
                            <select
                                className="form-control"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                            >
                                <option value="2">Empleado</option>
                                <option value="1">Administrador</option>
                            </select>
                        </div>
    
                        <button type="submit" className="btn btn-primary me-2">
                            {editando ? "Guardar Cambios" : "Agregar Usuario"}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={resetFormulario}>
                            Cancelar
                        </button>
                    </form>
                </div>
            ) : (
                <div>
                    <table className="table table-hover shadow-sm rounded">
                        <thead className="table-light">
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                {userRole === "1" && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.IDUsuario} className="align-middle">
                                    <td className="d-flex align-items-center">
                                        <span className="avatar me-2">{usuario.Nombre.charAt(0)}</span>
                                        {usuario.Nombre}
                                    </td>
                                    <td>{usuario.Correo}</td>
                                    <td>
                                        <span className={`badge ${usuario.IDRol === 1 ? "bg-primary" : "bg-secondary"}`}>
                                            {usuario.IDRol === 1 ? "ADMIN" : "USER"}
                                        </span>
                                    </td>
                                    {userRole === "1" && (
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => iniciarEdicion(usuario)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(usuario.IDUsuario)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
    
            {userRole === "1" && !mostrarFormulario && (
                <button className="fab-button" onClick={() => setMostrarFormulario(true)}>
                    <FontAwesomeIcon icon={faPlus} size="lg" />
                </button>
            )}
        </div>
    );
    
    
};

export default Usuarios;
