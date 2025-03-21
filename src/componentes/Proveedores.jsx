import { useState, useEffect } from "react";
import axios from "axios";
import "../css/Proveedores.css";

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [codigoProveedor, setCodigoProveedor] = useState("");
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [telefono, setTelefono] = useState("");
    const [tipoProveedor, setTipoProveedor] = useState("Oro");
    const [codigos, setCodigos] = useState("");
    const [editando, setEditando] = useState(false);
    const [idProveedor, setIdProveedor] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/proveedores");
            setProveedores(response.data);
        } catch (error) {
            console.error(" Error al obtener proveedores:", error);
            alert("Error al cargar los proveedores");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!codigoProveedor.trim()) {
            alert("El código de proveedor es obligatorio.");
            return;
        }

        const codigosArray = typeof codigos === "string" ? codigos.split(",").map(c => c.trim()) : codigos;

        const proveedorData = {
            codigoProveedor,
            nombre,
            direccion,
            telefono,
            tipoProveedor,
            codigos: codigosArray
        };

        try {
            if (editando) {
                // EDITAR proveedor
                const response = await axios.put(`http://localhost:5000/api/proveedores/${idProveedor}`, proveedorData);
                alert("Proveedor editado con éxito");
            } else {
                // AGREGAR nuevo proveedor
                const response = await axios.post("http://localhost:5000/api/proveedores", proveedorData);
                alert("Proveedor agregado con éxito");
            }

            fetchProveedores();
            resetFormulario();
        } catch (error) {
            console.error("❌ Error al guardar proveedor:", error.response?.data || error);
            alert("Error al guardar proveedor: " + (error.response?.data?.message || "Error desconocido"));
        }
    };

    const iniciarEdicion = (proveedor) => {
        setIdProveedor(proveedor.IDProveedor);
        setCodigoProveedor(proveedor.CodigoProveedor || "");
        setNombre(proveedor.Nombre);
        setDireccion(proveedor.Direccion);
        setTelefono(proveedor.Telefono);
        setTipoProveedor(proveedor.TipoProveedor);
        setCodigos(proveedor.CodigosProductos);
        setEditando(true);
        setMostrarFormulario(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el proveedor con ID: ${id}?`)) return;

        try {
            await axios.delete(`http://localhost:5000/api/proveedores/${id}`);
            alert("Proveedor eliminado con éxito");
            fetchProveedores();
        } catch (error) {
            alert("Error al eliminar proveedor: " + (error.response?.data?.message || "Error desconocido"));
        }
    };

    const resetFormulario = () => {
        setIdProveedor(null);
        setCodigoProveedor("");
        setNombre("");
        setDireccion("");
        setTelefono("");
        setTipoProveedor("Oro");
        setCodigos("");
        setEditando(false);
        setMostrarFormulario(false);
    };

    return (
        <div id="proveedores-container" className="container mt-4">
            {!editando && !mostrarFormulario && <h2>Gestión de Proveedores</h2>}

            {mostrarFormulario ? (
                <div className="proveedores-form">
                    <h4 className="text-center">{editando ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</h4>
                    <form onSubmit={handleSave}>
                        <div className="mb-2">
                            <label className="form-label">Código de Proveedor</label>
                            <input
                                type="text"
                                className="form-control"
                                value={codigoProveedor}
                                onChange={(e) => setCodigoProveedor(e.target.value)}
                                required
                                disabled={editando} // 🔒 Deshabilitado al editar
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Nombre</label>
                            <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Dirección</label>
                            <input type="text" className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Teléfono</label>
                            <input type="text" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Tipo de Proveedor</label>
                            <select className="form-control" value={tipoProveedor} onChange={(e) => setTipoProveedor(e.target.value)}>
                                <option value="Oro">Oro</option>
                                <option value="Plata">Plata</option>
                                <option value="Acero">Acero</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Códigos (separados por comas)</label>
                            <input type="text" className="form-control" value={codigos} onChange={(e) => setCodigos(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary me-2">{editando ? "Guardar Cambios" : "Agregar Proveedor"}</button>
                        <button type="button" className="btn btn-secondary" onClick={resetFormulario}>Cancelar</button>
                    </form>
                </div>
            ) : (
                <>
                    <table className="table table-striped mt-4">
                        <thead>
                            <tr>
                                <th>Código Proveedor</th>
                                <th>Nombre</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                <th>Tipo</th>
                                <th>Códigos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.map((prov) => (
                                <tr key={prov.IDProveedor}>
                                    <td>{prov.CodigoProveedor}</td>
                                    <td>{prov.Nombre}</td>
                                    <td>{prov.Direccion}</td>
                                    <td>{prov.Telefono}</td>
                                    <td>{prov.TipoProveedor}</td>
                                    <td>{prov.CodigosProductos}</td>
                                    <td>
                                        <button className="btn btn-editar me-2" onClick={() => iniciarEdicion(prov)}>Editar</button>
                                        <button className="btn btn-eliminar" onClick={() => handleDelete(prov.IDProveedor)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="fab-button" onClick={() => setMostrarFormulario(true)}>+</button>
                </>
            )}
        </div>
    );
};

export default Proveedores;
