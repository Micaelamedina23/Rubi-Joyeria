import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // ✅ Asegura que Express maneje JSON correctamente

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "matute",
    database: "Proyecto_para_recibirnos2",
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
    } else {
        console.log("Conexión exitosa a la base de datos.");
    }
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tucorreo@gmail.com",
        pass: "tucontraseña",
    },
});

// 🔹 Middleware para verificar si un usuario es administrador
const verificarAdmin = (req, res, next) => {
    let userRole = req.headers["user-role"] || req.get("user-role"); // Capturar el header en minúscula o mayúscula

    console.log(" Rol recibido en el backend:", userRole); // 👉 Verificar qué llega en el backend

    if (!userRole) {
        return res.status(403).json({ message: "No se proporcionó un rol en la solicitud." });
    }

    userRole = userRole.toString().trim(); // Convertir a string y eliminar espacios

    if (userRole.toString().trim() !== "1") 
        {
        return res.status(403).json({ message: `Acceso denegado. Se requiere rol de administrador. Recibido: ${userRole}` });
    }

    next();
};



// 🔹 Ruta para obtener todos los usuarios (solo para administradores)
app.get("/api/usuarios", (req, res) => {
    const query = "SELECT IDUsuario, Nombre, Correo, IDRol FROM Usuarios";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener usuarios:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        res.json(results);
    });
});

// 🔹 Ruta para editar correo y contraseña de un usuario (solo admin)
app.put("/api/usuarios/:id", verificarAdmin, (req, res) => {
    const { id } = req.params;
    let { Nombre, Correo, Contraseña, IDRol } = req.body;

    if (!Nombre || !Correo) {
        return res.status(400).json({ message: "El nombre y el correo son obligatorios." });
    }

    IDRol = parseInt(IDRol, 10);
    if (isNaN(IDRol)) {
        return res.status(400).json({ message: "El rol debe ser un número válido." });
    }

    let query;
    let values;

    if (Contraseña && Contraseña.trim() !== "") {
        query = "UPDATE Usuarios SET Nombre = ?, Correo = ?, Contrasena = ?, IDRol = ? WHERE IDUsuario = ?";
        values = [Nombre, Correo, Contraseña, IDRol, id];
    } else {
        query = "UPDATE Usuarios SET Nombre = ?, Correo = ?, IDRol = ? WHERE IDUsuario = ?";
        values = [Nombre, Correo, IDRol, id];
    }


    db.query(query, values, (err, result) => {
        if (err) {
            console.error("❌ Error al actualizar usuario:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.json({ message: "Usuario actualizado correctamente." });
    });
});

// 🔹 Ruta para eliminar un usuario (solo admin)
app.delete("/api/usuarios/:id", verificarAdmin, (req, res) => {
    const { id } = req.params;

    // Evitar que un administrador se elimine a sí mismo (opcional)
    const userRole = req.headers["user-role"];
    const userId = req.headers["user-id"]; // Requiere enviar también el ID desde el frontend

    if (userId && parseInt(userId) === parseInt(id)) {
        return res.status(403).json({ message: "No puedes eliminar tu propio usuario." });
    }

    const query = "DELETE FROM Usuarios WHERE IDUsuario = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("❌ Error al eliminar usuario:", err);
            return res.status(500).json({ message: "Error al eliminar usuario.", error: err.sqlMessage || err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({ message: "✅ Usuario eliminado correctamente." });
    });
});


// 🔹 Ruta para eliminar usuarios (solo admin)
app.delete("/api/proveedores/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM Proveedores WHERE IDProveedor = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(" Error al eliminar proveedor:", err);
            return res.status(500).json({ message: "Error al eliminar proveedor.", error: err.sqlMessage || err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado." });
        }
        res.json({ message: "Proveedor eliminado correctamente." });
    });
});


// 🔹 Ruta para login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Por favor, complete todos los campos." });
    }

    const query = "SELECT IDUsuario, Nombre, IDRol FROM Usuarios WHERE Correo = ? AND Contrasena = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }

        if (results.length > 0) {
            const { IDUsuario, Nombre, IDRol } = results[0];
            res.json({
                message: "Inicio de sesión exitoso.",
                userId: IDUsuario,
                userName: Nombre,
                userRole: IDRol.toString(),
            });
        } else {
            res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }
    });
});

// 🔹 Ruta para registrar usuarios
app.post("/api/register", (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Por favor, complete todos los campos." });
    }

    const query = "INSERT INTO Usuarios (Nombre, Correo, Contrasena, IDRol) VALUES (?, ?, ?, ?)";
    db.query(query, [name, email, password, role], (err) => {
        if (err) {
            console.error("Error al registrar al usuario:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        res.json({ message: "Usuario registrado exitosamente." });
    });
});

// 🔹 Rutas de recuperación de contraseña
app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Por favor, ingrese su correo." });

    const code = Math.floor(100000 + Math.random() * 900000);
    const query = "UPDATE Usuarios SET CodigoRecuperacion = ? WHERE Correo = ?";

    db.query(query, [code, email], (err, results) => {
        if (err) {
            console.error("Error al generar el código:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: "Correo no encontrado." });

        const mailOptions = {
            from: '"Recuperación de Contraseña" <tucorreo@gmail.com>',
            to: email,
            subject: "Código de Recuperación",
            text: `Tu código de recuperación es: ${code}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
                return res.status(500).json({ message: "Error al enviar el correo." });
            }
            res.json({ message: "Código enviado. Por favor, revise su correo." });
        });
    });
});

// 🔹 Ruta para obtener todos los proveedores
app.get("/api/proveedores", (req, res) => {
    const query = "SELECT * FROM Proveedores";
    db.query(query, (err, results) => {
        if (err) {
            console.error(" Error al obtener proveedores:", err);
            return res.status(500).json({ message: "Error del servidor al obtener proveedores." });
        }
        res.json(results);
    });
});

// 🔹 Ruta para registrar un proveedor
app.post("/api/proveedores", (req, res) => {
    let { codigoProveedor, nombre, direccion, telefono, tipoProveedor, codigos } = req.body;

    // Verificar que no haya valores vacíos
    if (!codigoProveedor || !nombre || !direccion || !telefono || !tipoProveedor || !codigos) {
        return res.status(400).json({ message: "Todos los campos, incluido el Código de Proveedor, son obligatorios." });
    }

    //  Convertir codigos en array si es necesario
    if (typeof codigos === "string") {
        codigos = [codigos];
    }
    if (!Array.isArray(codigos) || codigos.length === 0) {
        return res.status(400).json({ message: "El campo 'codigos' debe ser un array válido." });
    }

    const codigosProductos = codigos.join(",");

    // 🔹 Verificar si el código de proveedor ya existe antes de insertarlo
    const checkQuery = "SELECT COUNT(*) AS count FROM Proveedores WHERE CodigoProveedor = ?";
    db.query(checkQuery, [codigoProveedor], (err, result) => {
        if (err) {
            console.error(" Error al verificar código de proveedor:", err);
            return res.status(500).json({ message: "Error del servidor al verificar código de proveedor." });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ message: "El código de proveedor ya existe. Usa uno diferente." });
        }

        // 🔹 Insertar proveedor si el código no existe
        const insertQuery = `
            INSERT INTO Proveedores (CodigoProveedor, Nombre, Direccion, Telefono, TipoProveedor, CodigosProductos)
            VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(insertQuery, [codigoProveedor, nombre, direccion, telefono, tipoProveedor, codigosProductos], (err, result) => {
            if (err) {
                console.error(" Error al insertar proveedor:", err);
                return res.status(500).json({ message: "Error del servidor al registrar proveedor.", error: err.sqlMessage || err });
            }
            res.json({ message: "Proveedor registrado correctamente.", proveedorId: result.insertId });
        });
    });
});

app.put("/api/proveedores/:id", (req, res) => {
    const { id } = req.params;
    let { codigoProveedor, nombre, direccion, telefono, tipoProveedor, codigos } = req.body;

    if (!codigoProveedor || !nombre || !direccion || !telefono || !tipoProveedor || !codigos) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    if (typeof codigos === "string") {
        codigos = [codigos];
    }
    if (!Array.isArray(codigos) || codigos.length === 0) {
        return res.status(400).json({ message: "El campo 'codigos' debe ser un array válido." });
    }

    const codigosProductos = codigos.join(",");

    const query = `
        UPDATE Proveedores 
        SET CodigoProveedor = ?, Nombre = ?, Direccion = ?, Telefono = ?, TipoProveedor = ?, CodigosProductos = ?
        WHERE IDProveedor = ?`;

    db.query(query, [codigoProveedor, nombre, direccion, telefono, tipoProveedor, codigosProductos, id], (err, result) => {
        if (err) {
            console.error("❌ Error al actualizar proveedor:", err);
            return res.status(500).json({ message: "Error del servidor al actualizar proveedor." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado." });
        }
        res.json({ message: "✅ Proveedor actualizado con éxito." });
    });
});

// 🔹 Ruta para eliminar un proveedor por ID
app.delete("/api/proveedores/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM Proveedores WHERE IDProveedor = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(" Error al eliminar proveedor:", err);
            return res.status(500).json({ message: "Error al eliminar proveedor.", error: err.sqlMessage || err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado." });
        }
        res.json({ message: "Proveedor eliminado correctamente." });
    });
});


// 🔹 Ruta para obtener todas las compras (incluyendo "DetallesProducto")
app.get("/api/compras", (req, res) => {
    const query = `
        SELECT c.IDCompra, c.Fecha, c.CodigoProveedor, p.Nombre AS NombreProveedor, 
               c.CodigoProducto, c.Cantidad, c.PrecioTotal, c.DetallesProducto
        FROM Compras c
        LEFT JOIN Proveedores p ON c.CodigoProveedor = p.CodigoProveedor
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("  ERROR AL OBTENER COMPRAS:", err.sqlMessage || err);
            return res.status(500).json({ 
                message: "Error al obtener compras.", 
                error: err.sqlMessage || err.message 
            });
        }

        console.log(" Compras obtenidas correctamente:", results);
        res.json(results);
    });
});

// 🔹 Ruta para registrar una nueva compra con "DetallesProducto"
app.post("/api/compras", (req, res) => {
    let { fecha, CodigoProveedor, CodigoProducto, cantidad, PrecioTotal, DetallesProducto } = req.body;

    if (!fecha || !CodigoProveedor || !CodigoProducto || !cantidad || !PrecioTotal) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    cantidad = parseInt(cantidad);
    PrecioTotal = parseFloat(PrecioTotal);
    DetallesProducto = DetallesProducto ? DetallesProducto.trim() : "Sin detalles";  // ✅ Guarda un valor si está vacío

    if (isNaN(cantidad) || cantidad <= 0 || isNaN(PrecioTotal) || PrecioTotal <= 0) {
        return res.status(400).json({ message: "Cantidad y PrecioTotal deben ser valores numéricos mayores a 0." });
    }

    const query = `
        INSERT INTO Compras (Fecha, CodigoProveedor, CodigoProducto, Cantidad, PrecioTotal, DetallesProducto)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    console.log("🔹 Insertando compra con detalles:", fecha, CodigoProveedor, CodigoProducto, cantidad, PrecioTotal, DetallesProducto);

    db.query(query, [fecha, CodigoProveedor, CodigoProducto, cantidad, PrecioTotal, DetallesProducto], (err, result) => {
        if (err) {
            console.error("❌ ERROR AL REGISTRAR COMPRA:", err.sqlMessage || err);
            return res.status(500).json({ message: "Error al registrar compra.", error: err.sqlMessage || err });
        }
        res.json({ message: "✅ Compra registrada con éxito.", idCompra: result.insertId });
    });
});

// 🔹 Obtener el stock actual
app.get("/api/stock", (req, res) => {
    const query = `
        SELECT 
            s.IDStock,
            s.CodigoProducto,
            s.Descripcion,
            COALESCE(SUM(s.Cantidad), 0) AS Cantidad, 
            CAST(s.PrecioCompra AS DECIMAL(10,2)) AS PrecioCompra,
            CAST(s.PrecioVenta AS DECIMAL(10,2)) AS PrecioVenta,
            MAX(c.DetallesProducto) AS DetallesProducto  
        FROM Stock s
        LEFT JOIN Compras c ON s.CodigoProducto = c.CodigoProducto
        GROUP BY s.IDStock, s.CodigoProducto, s.Descripcion, s.PrecioCompra, s.PrecioVenta
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ ERROR AL OBTENER STOCK:", err.sqlMessage || err);
            return res.status(500).json({ message: "Error al obtener stock.", error: err.sqlMessage || err });
        }

        // 🔹 Verificamos los datos que se están enviando al frontend
        console.log("✅ Datos enviados al frontend:", results);

        res.json(results);
    });
});





// 🔹 Ajustar stock manualmente (si necesitas modificarlo sin compra/venta)
app.put("/api/stock/:codigoProducto", (req, res) => {
    const { codigoProducto } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ message: "Cantidad inválida." });
    }

    const query = "UPDATE Stock SET Cantidad = ? WHERE CodigoProducto = ?";
    db.query(query, [cantidad, codigoProducto], (err, result) => {
        if (err) {
            console.error("❌ ERROR AL ACTUALIZAR STOCK:", err.sqlMessage || err);
            return res.status(500).json({ message: "Error al actualizar stock.", error: err.sqlMessage || err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado en stock." });
        }
        res.json({ message: "✅ Stock actualizado correctamente." });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});