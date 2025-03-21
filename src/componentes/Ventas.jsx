import { useState, useEffect } from "react";
import axios from "axios";
import "../css/Ventas.css";

const Ventas = () => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/stock");
            setProductos(res.data);
        } catch (error) {
            console.error("Error al obtener productos:", error);
        }
    };

    const handleBusqueda = (e) => {
        const valor = e.target.value;
        setBusqueda(valor);
        const filtrados = productos.filter(
            p =>
                p.CodigoProducto.toLowerCase().includes(valor.toLowerCase()) ||
                p.Descripcion.toLowerCase().includes(valor.toLowerCase())
        );
        setProductosFiltrados(filtrados);
    };

    const agregarAlCarrito = (producto) => {
        const yaEsta = carrito.find(p => p.CodigoProducto === producto.CodigoProducto);
        if (yaEsta) return alert("Ya agregaste este producto.");
        const conCantidad = { ...producto, cantidad: 1, subtotal: producto.PrecioCompra };
        setCarrito([...carrito, conCantidad]);
    };

    const actualizarCantidad = (codigo, nuevaCantidad) => {
        const actualizado = carrito.map(p => {
            if (p.CodigoProducto === codigo) {
                const cantidad = parseInt(nuevaCantidad);
                return {
                    ...p,
                    cantidad,
                    subtotal: cantidad * p.PrecioCompra
                };
            }
            return p;
        });
        setCarrito(actualizado);
        calcularTotal(actualizado);
    };

    const eliminarDelCarrito = (codigo) => {
        const filtrado = carrito.filter(p => p.CodigoProducto !== codigo);
        setCarrito(filtrado);
        calcularTotal(filtrado);
    };

    const calcularTotal = (items) => {
        const suma = items.reduce((acc, item) => acc + item.subtotal, 0);
        setTotal(suma);
    };

    const confirmarVenta = async () => {
        if (carrito.length === 0) return alert("No hay productos en la venta.");

        try {
            const venta = {
                fecha: new Date().toISOString().split("T")[0],
                detalles: carrito.map(p => ({
                    CodigoProducto: p.CodigoProducto,
                    Cantidad: p.cantidad,
                    Subtotal: p.subtotal
                }))
            };

            const res = await axios.post("http://localhost:5000/api/ventas", venta);
            alert("Venta registrada correctamente.");
            setCarrito([]);
            setTotal(0);
        } catch (error) {
            console.error("Error al registrar venta:", error);
            alert("Error al guardar venta.");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Registrar Venta</h2>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Buscar por código o nombre del producto"
                value={busqueda}
                onChange={handleBusqueda}
            />

            <div className="table-responsive mb-4">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Stock</th>
                            <th>Precio</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map(p => (
                            <tr key={p.CodigoProducto}>
                                <td>{p.CodigoProducto}</td>
                                <td>{p.Descripcion}</td>
                                <td>{p.Cantidad}</td>
                                <td>${parseFloat(p.PrecioCompra).toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => agregarAlCarrito(p)}
                                    >
                                        Agregar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {carrito.length > 0 && (
                <>
                    <h4>Detalle de Venta</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {carrito.map(p => (
                                <tr key={p.CodigoProducto}>
                                    <td>{p.CodigoProducto}</td>
                                    <td>{p.Descripcion}</td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={p.cantidad}
                                            min="1"
                                            max={p.Cantidad}
                                            onChange={(e) =>
                                                actualizarCantidad(p.CodigoProducto, e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>${parseFloat(p.PrecioCompra).toFixed(2)}</td>
                                    <td>${parseFloat(p.subtotal).toFixed(2)}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => eliminarDelCarrito(p.CodigoProducto)}
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-end">
                        <h5>Total: ${parseFloat(total).toFixed(2)}</h5>
                        <button className="btn btn-primary" onClick={confirmarVenta}>
                            Confirmar Venta
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Ventas;
