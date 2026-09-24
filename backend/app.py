import os
import uuid
import re
import secrets
import hashlib
import traceback
from datetime import datetime, timedelta
import requests
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from flask_mail import Mail, Message
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt, get_jwt_identity
)
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from email_validator import validate_email, EmailNotValidError
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
# ==============================================================================
# 1. CONFIGURACIÓN INICIAL DE LA APLICACIÓN Y EXTENSIONES
# ==============================================================================

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', os.path.join(app.root_path, 'static', 'uploads'))
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

CORS(app)     #Estoy Aburrido
# Claves secretas y seguridad
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'mi_clave_secreta_super_segura_123_beta_grafica')
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET', 'beta_secret_key_ultra_segura_1997')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
ABSTRACT_API_KEY = os.getenv("ABSTRACT_API_KEY", "TU_API_KEY_AQUI")

# Configuración de Servidor SMTP (Email)
#
# Gmail requiere una CONTRASEÑA DE APLICACIÓN cuando se usa SMTP
# con una cuenta que tiene verificación en dos pasos.
# No pongas tu contraseña normal de Gmail aquí.
#
# Variables esperadas: MAIL_SERVER, MAIL_PORT, MAIL_USE_TLS,
# MAIL_USE_SSL, MAIL_USERNAME y MAIL_PASSWORD.
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes', 'on')
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() in ('true', '1', 'yes', 'on')
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'betagrafica60@gmail.com') #pipi6060 (Contraseña del gmail)
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'zjalqzpxemcrirks')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])
app.config['MAIL_TIMEOUT'] = int(os.getenv('MAIL_TIMEOUT', '20'))

if not app.config['MAIL_PASSWORD']:
    print('⚠️ [SMTP] MAIL_PASSWORD no está configurada. Los correos no podrán enviarse.')

# Inicialización de extensiones
mail = Mail(app)
jwt = JWTManager(app)
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])


# ==============================================================================
# 2. CONEXIÓN A BASE DE DATOS Y SCHEMAS (TABLAS)
# ==============================================================================

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'betagrafica'),
        charset='utf8mb4',
        use_pure=True
    )

def agregar_columna_si_no_existe(cursor, tabla, nombre_columna, definicion_sql):
    cursor.execute(f"SHOW COLUMNS FROM `{tabla}` LIKE %s", (nombre_columna,))
    if cursor.fetchone():
        return
    cursor.execute(f"ALTER TABLE `{tabla}` ADD COLUMN {definicion_sql}")


def init_db():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Tabla Usuarios
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                email_verificado TINYINT(1) DEFAULT 0,
                token_verificacion VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Campos para recuperación de contraseña mediante código de un solo uso.
        agregar_columna_si_no_existe(
            cursor, 'usuarios', 'reset_code_hash',
            'reset_code_hash VARCHAR(128) DEFAULT NULL'
        )
        agregar_columna_si_no_existe(
            cursor, 'usuarios', 'reset_code_expires',
            'reset_code_expires DATETIME DEFAULT NULL'
        )

        # Garantiza que no existan dos nombres de usuario iguales.
        # La collation utf8mb4_general_ci usada por la BD es case-insensitive.
        try:
            cursor.execute("SHOW INDEX FROM usuarios WHERE Key_name = 'uq_usuarios_nombre'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_nombre (nombre)")
        except Error as index_error:
            print(f"🟡 [BD] No se pudo crear el índice único de nombre: {index_error}")

        # Tabla Productos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(255) DEFAULT NULL,
                nombre VARCHAR(255) NOT NULL,
                categoria VARCHAR(100) DEFAULT NULL,
                precio DECIMAL(10,2) DEFAULT 0.00,
                imagen LONGTEXT DEFAULT NULL,
                color VARCHAR(100) DEFAULT NULL,
                medida VARCHAR(100) DEFAULT NULL,
                stock INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                activo TINYINT(1) DEFAULT 1
            )
        """)

        # Tabla Carousel / Banner
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS carousel_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(150) DEFAULT '',
                imagen VARCHAR(500) DEFAULT NULL,
                producto_id INT DEFAULT NULL,
                orden INT DEFAULT 0,
                activo TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
            )
        """)

        # Tabla Facturas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS facturas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                cliente_nombre VARCHAR(255) DEFAULT NULL,
                cliente_email VARCHAR(255) DEFAULT NULL,
                tipo_venta VARCHAR(30) DEFAULT 'manual',
                notas TEXT DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        """)

        # Tabla Detalles Factura
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS detalles_factura (
                id INT AUTO_INCREMENT PRIMARY KEY,
                factura_id INT NOT NULL,
                producto_id INT DEFAULT NULL,
                unidades INT NOT NULL DEFAULT 1,
                precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                nombre_producto VARCHAR(255) DEFAULT NULL,
                descripcion TEXT DEFAULT NULL,
                FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
            )
        """)

        agregar_columna_si_no_existe(cursor, 'productos', 'codigo', 'codigo VARCHAR(255) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'productos', 'categoria', 'categoria VARCHAR(100) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'productos', 'precio', 'precio DECIMAL(10,2) DEFAULT 0.00')
        agregar_columna_si_no_existe(cursor, 'productos', 'color', 'color VARCHAR(100) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'productos', 'medida', 'medida VARCHAR(100) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'productos', 'stock', 'stock INT DEFAULT 0')
        # Compatibilidad con bases de datos creadas con versiones anteriores:
        # la asignación masiva de imágenes necesita que productos.imagen exista.
        agregar_columna_si_no_existe(cursor, 'productos', 'imagen', 'imagen LONGTEXT DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'facturas', 'cliente_nombre', 'cliente_nombre VARCHAR(255) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'facturas', 'cliente_email', 'cliente_email VARCHAR(255) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'facturas', 'tipo_venta', 'tipo_venta VARCHAR(30) DEFAULT "manual"')
        agregar_columna_si_no_existe(cursor, 'facturas', 'notas', 'notas TEXT DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'facturas', 'estado_factura', 'estado_factura VARCHAR(30) DEFAULT "pendiente"')

        # Tabla Pedidos / Seguimiento de Órdenes. Debe existir antes de las
        # migraciones que consultan pedidos para normalizar facturas.
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                producto_id INT DEFAULT NULL,
                factura_id INT DEFAULT NULL,
                unidades INT NOT NULL DEFAULT 1,
                precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                fecha_entrega DATE DEFAULT NULL,
                prioridad VARCHAR(20) DEFAULT 'media',
                estado VARCHAR(30) DEFAULT 'Pendiente',
                FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
                FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE SET NULL
            )
        """)

        # Si la tabla pedidos ya existía, aseguramos las columnas nuevas.
        agregar_columna_si_no_existe(cursor, 'pedidos', 'factura_id', 'factura_id INT DEFAULT NULL')

        # Los nuevos registros deben comenzar SIEMPRE como pendientes.
        # Si la columna ya existía con DEFAULT "completada", corregimos el DEFAULT.
        try:
            cursor.execute("ALTER TABLE facturas MODIFY COLUMN estado_factura VARCHAR(30) DEFAULT 'pendiente'")
        except Error as e:
            print(f"🟡 [BD] No se pudo actualizar el DEFAULT de estado_factura: {e}")

        # Corrige registros creados por la versión anterior que quedaron como
        # "completada" automáticamente mientras sus pedidos seguían pendientes.
        try:
            cursor.execute("""
                UPDATE facturas f
                SET f.estado_factura = 'pendiente'
                WHERE LOWER(COALESCE(f.estado_factura, '')) IN ('completada', 'completed')
                  AND EXISTS (
                      SELECT 1
                      FROM pedidos p
                      WHERE p.factura_id = f.id
                        AND LOWER(COALESCE(p.estado, 'pendiente')) <> 'completado'
                  )
            """)
        except Error as e:
            print(f"🟡 [BD] No se pudieron normalizar registros pendientes: {e}")

        agregar_columna_si_no_existe(cursor, 'detalles_factura', 'nombre_producto', 'nombre_producto VARCHAR(255) DEFAULT NULL')
        agregar_columna_si_no_existe(cursor, 'detalles_factura', 'descripcion', 'descripcion TEXT DEFAULT NULL')
        conn.commit()
        print("🟢 [BD] Estructura de tablas inicializada correctamente.")
    except Error as e:
        print(f"🔴 [BD] Error al inicializar tablas: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

init_db()


# ==============================================================================
# 3. FUNCIONES AUXILIARES DE SOPORTE Y EMAIL
# ==============================================================================

def normalizar_imagen(valor):
    if not valor or not isinstance(valor, str):
        return None
    valor = valor.strip()
    return valor if valor else None


def guardar_imagen_subida(archivo):
    if not archivo or not getattr(archivo, 'filename', ''):
        return None

    upload_folder = app.config.get('UPLOAD_FOLDER')
    if upload_folder:
        os.makedirs(upload_folder, exist_ok=True)

    nombre_archivo = secure_filename(archivo.filename)
    if not nombre_archivo:
        return None

    extension = os.path.splitext(nombre_archivo)[1].lower()
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_destino = os.path.join(upload_folder, nombre_unico)
    archivo.save(ruta_destino)

    return nombre_unico


def normalizar_rol(role):
    return role.strip().lower() if role else "user"


def normalizar_producto(producto):
    if not producto:
        return None

    producto_normalizado = dict(producto)

    try:
        producto_normalizado['precio'] = float(producto_normalizado['precio']) if producto_normalizado.get('precio') not in (None, '') else 0.0
    except (TypeError, ValueError):
        producto_normalizado['precio'] = 0.0

    producto_normalizado['imagen'] = normalizar_imagen(producto_normalizado.get('imagen'))
    producto_normalizado['nombre'] = str(producto_normalizado.get('nombre') or '').strip() or 'Sin nombre'
    producto_normalizado['color'] = str(producto_normalizado.get('color') or '').strip() or None
    producto_normalizado['medida'] = str(producto_normalizado.get('medida') or '').strip() or None
    producto_normalizado['stock'] = int(producto_normalizado.get('stock', 0) or 0)
    producto_normalizado['codigo'] = str(producto_normalizado.get('codigo') or '').strip() or None
    producto_normalizado['categoria'] = str(producto_normalizado.get('categoria') or '').strip() or None

    return producto_normalizado


def obtener_o_crear_producto(conn, producto_id, nombre=None, precio=None, imagen=None, cursor=None):
    if producto_id in [None, '', 'None']:
        return None

    try:
        producto_id = int(producto_id)
    except (TypeError, ValueError):
        return None

    cursor_actual = cursor or conn.cursor(dictionary=True)
    cursor_actual.execute("SELECT id, nombre, precio, imagen FROM productos WHERE id = %s", (producto_id,))
    producto_existente = cursor_actual.fetchone()
    if producto_existente:
        producto_existente['imagen'] = normalizar_imagen(producto_existente.get('imagen'))
        return producto_existente

    nombre_final = (nombre or f"Producto #{producto_id}").strip() or f"Producto #{producto_id}"
    precio_final = float(precio) if precio is not None else 0.0
    imagen_final = normalizar_imagen(imagen) if imagen is not None else None

    cursor_actual.execute(
        "INSERT INTO productos (id, nombre, precio, imagen) VALUES (%s, %s, %s, %s)",
        (producto_id, nombre_final, precio_final, imagen_final)
    )

    cursor_actual.execute("SELECT id, nombre, precio, imagen FROM productos WHERE id = %s", (producto_id,))
    prod = cursor_actual.fetchone()
    if prod:
        prod['imagen'] = normalizar_imagen(prod.get('imagen'))
    return prod

def enviar_email(asunto, destinatario, cuerpo_html):
    """Envía un correo HTML mediante Flask-Mail y registra el error real si falla."""
    try:
        if not app.config.get('MAIL_USERNAME'):
            print('🔴 [SMTP] MAIL_USERNAME no está configurado.')
            return False

        if not app.config.get('MAIL_PASSWORD'):
            print('🔴 [SMTP] MAIL_PASSWORD no está configurada.')
            return False

        msg = Message(
            subject=asunto,
            recipients=[destinatario],
            sender=app.config['MAIL_DEFAULT_SENDER'],
            html=cuerpo_html
        )

        mail.send(msg)
        print(f'📧 [SMTP] Correo enviado correctamente a {destinatario}')
        return True

    except Exception as e:
        print('🔴 [SMTP] ERROR ENVIANDO EMAIL')
        print(f"   Servidor: {app.config.get('MAIL_SERVER')}:{app.config.get('MAIL_PORT')}")
        print(f"   Usuario: {app.config.get('MAIL_USERNAME')}")
        print(f"   TLS: {app.config.get('MAIL_USE_TLS')} | SSL: {app.config.get('MAIL_USE_SSL')}")
        print(f'   Error: {type(e).__name__}: {e}')
        traceback.print_exc()
        return False


# ==============================================================================
# 4. ENDPOINTS DE AUTENTICACIÓN Y USUARIOS
# ==============================================================================

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def registro():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json(silent=True) or {}
    nombre = data.get('nombre', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not nombre or not email or not password:
        return jsonify({"error": "Todos los campos son requeridos"}), 400

    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"error": "Dirección de correo no válida"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Validación de Correo Existente
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "El correo ya se encuentra registrado"}), 400

        # 2. NUEVA VALIDACIÓN: Nombre de usuario/Nombre existente
        cursor.execute("SELECT id FROM usuarios WHERE LOWER(nombre) = LOWER(%s)", (nombre,))
        if cursor.fetchone():
            return jsonify({"error": "Este nombre de usuario ya esta en uso"}), 400

        hashed_pw = generate_password_hash(password)
        token_verificacion = str(uuid.uuid4())

        cursor.execute(
            "INSERT INTO usuarios (nombre, email, password, role, email_verificado, token_verificacion) VALUES (%s, %s, %s, 'user', 0, %s)",
            (nombre, email, hashed_pw, token_verificacion)
        )
        conn.commit()

        link = f"http://localhost:5000/api/verificar-email/{token_verificacion}"
        html_body = f"""
            <h2>¡Bienvenido a Beta Gráfica, {nombre}!</h2>
            <p>Por favor confirma tu correo haciendo clic en el siguiente enlace:</p>
            <a href="{link}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verificar Mi Cuenta</a>
        """
        email_enviado = enviar_email("Verifica tu cuenta - Beta Gráfica", email, html_body)

        if not email_enviado:
            return jsonify({
                "message": "Usuario registrado, pero no se pudo enviar el correo de verificación. Revisa la configuración SMTP del servidor."
            }), 201

        return jsonify({"message": "Usuario registrado exitosamente. Revisa tu correo para verificar la cuenta."}), 201

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/verificar-email/<token>', methods=['GET'])
def verificar_email(token):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id FROM usuarios WHERE token_verificacion = %s", (token,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Token de verificación inválido o expirado"}), 400

        cursor.execute(
            "UPDATE usuarios SET email_verificado = 1, token_verificacion = NULL WHERE id = %s",
            (user['id'],)
        )
        conn.commit()
        return "<h1>¡Cuenta verificada con éxito! Ya puedes iniciar sesión.</h1>", 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Faltan credenciales"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, nombre, email, password, role, email_verificado FROM usuarios WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user['password'], password):
            return jsonify({"error": "Credenciales incorrectas"}), 401

        if not user.get('email_verificado'):
            return jsonify({"error": "Debes verificar tu correo electrónico antes de iniciar sesión."}), 403

        user.pop('password')
        user["role"] = normalizar_rol(user["role"])

        token = create_access_token(
            identity=str(user['id']), 
            additional_claims={"user_data": user}
        )
        return jsonify({"token": token, "user": user}), 200
    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/olvide-password', methods=['POST'])
def olvide_password():
    """Envía un código de 6 dígitos al correo registrado."""
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({"error": "El email es requerido"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, nombre, email FROM usuarios WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        # No revelamos si el correo existe o no.
        if user:
            codigo = f"{secrets.randbelow(1000000):06d}"
            codigo_hash = hashlib.sha256(codigo.encode("utf-8")).hexdigest()
            expiracion = datetime.now() + timedelta(minutes=10)

            cursor.execute(
                """
                UPDATE usuarios
                SET reset_code_hash = %s,
                    reset_code_expires = %s
                WHERE id = %s
                """,
                (codigo_hash, expiracion, user['id'])
            )
            conn.commit()

            html_body = f"""
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
                    <h2 style="color:#1e3a8a;">Recuperación de contraseña</h2>
                    <p>Hola {user['nombre']}, recibimos una solicitud para cambiar tu contraseña de Beta Gráfica.</p>
                    <p>Tu código de recuperación es:</p>
                    <div style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;
                                padding:18px;background:#f1f5f9;border-radius:12px;color:#0f172a;">
                        {codigo}
                    </div>
                    <p>Este código vence en <strong>10 minutos</strong> y solo puede utilizarse una vez.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
            """

            if not enviar_email("Código de recuperación - Beta Gráfica", email, html_body):
                # Si el correo no pudo enviarse, invalida el código para que
                # no quede un código activo que el usuario nunca recibió.
                cursor.execute(
                    "UPDATE usuarios SET reset_code_hash = NULL, reset_code_expires = NULL WHERE id = %s",
                    (user['id'],)
                )
                conn.commit()
                return jsonify({
                    "error": "No se pudo enviar el correo de recuperación. Revisa la configuración SMTP del servidor."
                }), 500

        return jsonify({
            "message": "Si el correo está registrado, recibirás un código de recuperación."
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/verificar-codigo-recuperacion', methods=['POST'])
def verificar_codigo_recuperacion():
    """Comprueba que el código de recuperación sea válido y no haya vencido."""
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    codigo = str(data.get('codigo', '')).strip()

    if not email or not codigo:
        return jsonify({"error": "Correo y código son requeridos"}), 400

    if not re.fullmatch(r'\d{6}', codigo):
        return jsonify({"error": "El código debe tener 6 dígitos"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, reset_code_hash, reset_code_expires
            FROM usuarios
            WHERE email = %s
            """,
            (email,)
        )
        user = cursor.fetchone()

        if not user or not user.get('reset_code_hash') or not user.get('reset_code_expires'):
            return jsonify({"error": "El código no es válido o ya fue utilizado"}), 400

        if datetime.now() > user['reset_code_expires']:
            cursor.execute(
                "UPDATE usuarios SET reset_code_hash = NULL, reset_code_expires = NULL WHERE id = %s",
                (user['id'],)
            )
            conn.commit()
            return jsonify({"error": "El código ha expirado. Solicita uno nuevo."}), 400

        codigo_hash = hashlib.sha256(codigo.encode("utf-8")).hexdigest()

        if not secrets.compare_digest(codigo_hash, user['reset_code_hash']):
            return jsonify({"error": "El código ingresado es incorrecto"}), 400

        return jsonify({"message": "Código válido"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/restablecer-password', methods=['POST'])
def restablecer_password():
    """Cambia la contraseña usando el código de recuperación."""
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    codigo = str(data.get('codigo', '')).strip()
    nueva_clave = data.get('password', '')

    if not email or not codigo or not nueva_clave:
        return jsonify({"error": "Correo, código y nueva contraseña son requeridos"}), 400

    if not re.fullmatch(r'\d{6}', codigo):
        return jsonify({"error": "El código debe tener 6 dígitos"}), 400

    if len(nueva_clave) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, reset_code_hash, reset_code_expires
            FROM usuarios
            WHERE email = %s
            """,
            (email,)
        )
        user = cursor.fetchone()

        if not user or not user.get('reset_code_hash') or not user.get('reset_code_expires'):
            return jsonify({"error": "El código no es válido o ya fue utilizado"}), 400

        if datetime.now() > user['reset_code_expires']:
            cursor.execute(
                "UPDATE usuarios SET reset_code_hash = NULL, reset_code_expires = NULL WHERE id = %s",
                (user['id'],)
            )
            conn.commit()
            return jsonify({"error": "El código ha expirado. Solicita uno nuevo."}), 400

        codigo_hash = hashlib.sha256(codigo.encode("utf-8")).hexdigest()

        if not secrets.compare_digest(codigo_hash, user['reset_code_hash']):
            return jsonify({"error": "El código ingresado es incorrecto"}), 400

        hashed_pw = generate_password_hash(nueva_clave)

        cursor.execute(
            """
            UPDATE usuarios
            SET password = %s,
                reset_code_hash = NULL,
                reset_code_expires = NULL
            WHERE id = %s
            """,
            (hashed_pw, user['id'])
        )
        conn.commit()

        return jsonify({"message": "Contraseña actualizada exitosamente"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/perfil', methods=['GET', 'PUT'])
@jwt_required()
def perfil():
    claims = get_jwt()
    user_data = claims.get("user_data")
    user_id = user_data.get("id")

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            cursor.execute("SELECT id, nombre, email, role FROM usuarios WHERE id = %s", (user_id,))
            u = cursor.fetchone()
            return jsonify(u), 200

        elif request.method == 'PUT':
            data = request.get_json(silent=True) or {}
            nombre = data.get('nombre')
            password = data.get('password')

            if nombre:
                nombre = str(nombre).strip()
                cursor.execute(
                    "SELECT id FROM usuarios WHERE LOWER(nombre) = LOWER(%s) AND id <> %s",
                    (nombre, user_id)
                )
                if cursor.fetchone():
                    return jsonify({"error": "Este nombre de usuario ya esta en uso"}), 400

                cursor.execute("UPDATE usuarios SET nombre = %s WHERE id = %s", (nombre, user_id))
            if password:
                hashed = generate_password_hash(password)
                cursor.execute("UPDATE usuarios SET password = %s WHERE id = %s", (hashed, user_id))

            conn.commit()
            return jsonify({"message": "Perfil actualizado correctamente"}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/clientes', methods=['GET'])
@jwt_required()
def clientes():
    claims = get_jwt()
    user = claims.get("user_data")
    if not user or user.get("role") != "admin":
        return jsonify({"error": "No autorizado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, email, role FROM usuarios WHERE role = 'user' ORDER BY nombre ASC")
        return jsonify(cursor.fetchall()), 200
    except Exception:
        return jsonify([]), 200
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/usuarios/<int:user_id>', methods=['DELETE'])
@jwt_required()
def eliminar_usuario(user_id):
    claims = get_jwt()
    user = claims.get("user_data")
    if not user or user.get("role") != "admin":
        return jsonify({"error": "No autorizado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": "Usuario eliminado correctamente"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==============================================================================
# 5. ENDPOINTS DE PRODUCTOS
# ==============================================================================

@app.route('/api/productos', methods=['GET', 'POST'])
def manejar_productos():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            cursor.execute("SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC")
            lista_productos = [normalizar_producto(p) for p in cursor.fetchall()]
            return jsonify(lista_productos), 200

        elif request.method == 'POST':
            data = request.get_json(silent=True) or request.form

            nombre = (data.get('nombre') or '').strip()
            precio = data.get('precio', 0)
            try:
                precio = float(precio) if precio not in ('', None) else 0.0
            except (TypeError, ValueError):
                precio = 0.0

            color = (data.get('color') or '').strip() or None
            medida = (data.get('medida') or '').strip() or None
            stock = data.get('stock', 0)
            try:
                stock = int(stock) if stock not in ('', None) else 0
            except (TypeError, ValueError):
                stock = 0

            codigo = (data.get('codigo') or '').strip() or None
            categoria = (data.get('categoria') or '').strip() or None
            url_imagen = normalizar_imagen(data.get('imagen'))

            if not nombre:
                return jsonify({"error": "El nombre del producto es obligatorio"}), 400

            sql = """
                INSERT INTO productos (nombre, precio, color, medida, stock, imagen, codigo, categoria, activo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """
            cursor.execute(sql, (nombre, precio, color, medida, stock, url_imagen, codigo, categoria))
            conn.commit()
            nuevo_id = cursor.lastrowid

            producto_creado = {
                "id": nuevo_id,
                "nombre": nombre,
                "precio": precio,
                "color": color,
                "medida": medida,
                "stock": stock,
                "imagen": url_imagen,
                "codigo": codigo,
                "categoria": categoria,
                "activo": 1
            }

            return jsonify({
                "message": "Producto creado con éxito",
                "producto": normalizar_producto(producto_creado)
            }), 201

    except Exception as e:
        if conn: conn.rollback()
        print(f"🚨 ERROR EN MANEJAR PRODUCTOS: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/productos/asignar-imagen-masiva', methods=['POST', 'OPTIONS'])
def asignar_imagen_masiva_productos():
    """Asigna una misma imagen a todos los productos cuyo nombre contiene un término."""
    if request.method == 'OPTIONS':
        return '', 200

    @jwt_required()
    def procesar_asignacion():
        claims = get_jwt()
        user = claims.get('user_data')
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'No autorizado'}), 403

        termino = str(request.form.get('termino') or '').strip()
        sobrescribir = str(request.form.get('sobrescribir', 'true')).strip().lower() in ('true', '1', 'yes', 'on')
        archivo_imagen = request.files.get('imagen') if request.files else None

        if not termino:
            return jsonify({'error': 'El término de búsqueda es obligatorio'}), 400
        if not archivo_imagen or not getattr(archivo_imagen, 'filename', ''):
            return jsonify({'error': 'Debés seleccionar una imagen'}), 400

        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            patron = f'%{termino}%'

            sql = """
                SELECT id, nombre
                FROM productos
                WHERE activo = 1
                  AND LOWER(nombre) LIKE LOWER(%s)
            """
            params = [patron]
            if not sobrescribir:
                sql += " AND (imagen IS NULL OR TRIM(imagen) = '')"
            sql += " ORDER BY id ASC"
            cursor.execute(sql, tuple(params))
            productos_encontrados = cursor.fetchall()

            if not productos_encontrados:
                return jsonify({
                    'message': 'No se encontraron productos coincidentes',
                    'actualizados': 0,
                    'productos': []
                }), 200

            imagen_guardada = guardar_imagen_subida(archivo_imagen)
            if not imagen_guardada:
                return jsonify({'error': 'No se pudo guardar la imagen seleccionada'}), 400

            ids = [p['id'] for p in productos_encontrados]
            placeholders = ','.join(['%s'] * len(ids))
            cursor.execute(
                f"UPDATE productos SET imagen = %s WHERE id IN ({placeholders})",
                [imagen_guardada, *ids]
            )
            actualizados = cursor.rowcount
            conn.commit()

            return jsonify({
                'message': 'Imagen asignada correctamente',
                'actualizados': actualizados,
                'imagen': imagen_guardada,
                'productos': productos_encontrados
            }), 200
        except Exception as e:
            if conn:
                conn.rollback()
            print(f'🚨 ERROR EN ASIGNACION MASIVA DE IMAGEN: {str(e)}')
            return jsonify({'error': str(e)}), 500
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    return procesar_asignacion()


@app.route('/api/productos/<int:producto_id>', methods=['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'])
def manejar_producto_por_id(producto_id):
    if request.method == 'OPTIONS':
        return '', 200

    conn = None
    cursor = None

    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM productos WHERE id = %s AND activo = 1", (producto_id,))
            p = cursor.fetchone()
            if not p:
                return jsonify({"error": "Producto no encontrado"}), 404
            return jsonify(normalizar_producto(p)), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    @jwt_required()
    def procesar_escritura():
        claims = get_jwt()
        user = claims.get("user_data")
        if not user or user.get("role") != "admin":
            return jsonify({"error": "No autorizado"}), 403

        db_conn = None
        db_cursor = None
        try:
            db_conn = get_db_connection()
            db_cursor = db_conn.cursor(dictionary=True)

            if request.method == 'DELETE':
                db_cursor.execute("DELETE FROM carousel_items WHERE producto_id = %s", (producto_id,))
                db_cursor.execute("DELETE FROM detalles_factura WHERE producto_id = %s", (producto_id,))
                db_cursor.execute("DELETE FROM pedidos WHERE producto_id = %s", (producto_id,))
                db_cursor.execute("DELETE FROM productos WHERE id = %s", (producto_id,))

                if db_cursor.rowcount == 0:
                    return jsonify({"error": "El producto no existe o ya fue eliminado"}), 404

                db_conn.commit()
                return jsonify({"message": "Producto eliminado con éxito"}), 200

            data = request.get_json(silent=True) or request.form

            nombre = data.get('nombre')
            precio = data.get('precio')
            color = data.get('color')
            medida = data.get('medida')
            stock = data.get('stock')
            codigo = data.get('codigo')
            categoria = data.get('categoria')
            imagen = data.get('imagen')

            campos = []
            valores = []

            if nombre is not None:
                campos.append("nombre = %s")
                valores.append(str(nombre).strip())
            if precio is not None:
                campos.append("precio = %s")
                try:
                    valores.append(float(precio) if precio not in ('', None) else 0.0)
                except (TypeError, ValueError):
                    valores.append(0.0)
            if color is not None:
                campos.append("color = %s")
                valores.append(str(color).strip() or None)
            if medida is not None:
                campos.append("medida = %s")
                valores.append(str(medida).strip() or None)
            if stock is not None:
                campos.append("stock = %s")
                try:
                    valores.append(int(stock) if stock not in ('', None) else 0)
                except (TypeError, ValueError):
                    valores.append(0)
            if codigo is not None:
                campos.append("codigo = %s")
                valores.append(str(codigo).strip() or None)
            if categoria is not None:
                campos.append("categoria = %s")
                valores.append(str(categoria).strip() or None)
            if imagen is not None:
                campos.append("imagen = %s")
                valores.append(normalizar_imagen(imagen))

            if not campos:
                return jsonify({"error": "No se enviaron datos para actualizar"}), 400

            valores.append(producto_id)
            sql = f"UPDATE productos SET {', '.join(campos)} WHERE id = %s"
            db_cursor.execute(sql, tuple(valores))
            db_conn.commit()

            return jsonify({"message": "Producto actualizado correctamente"}), 200

        except Exception as e:
            if db_conn: db_conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            if db_cursor: db_cursor.close()
            if db_conn: db_conn.close()

    return procesar_escritura()


# ==============================================================================
# 6. ENDPOINTS DEL CARRUSEL / SLIDES DE PORTADA
# ===============>===============================================================

@app.route('/api/carousel', methods=['GET', 'POST'])
def manejar_carrusel():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            cursor.execute("SELECT * FROM carousel_items WHERE activo = 1 ORDER BY orden ASC, id ASC")
            items = cursor.fetchall()
            for item in items:
                item['imagen'] = normalizar_imagen(item.get('imagen'))
            return jsonify(items), 200

        elif request.method == 'POST':
            data = request.get_json(silent=True) or {}
            titulo = (data.get('titulo') or request.form.get('titulo', '')) or ''
            producto_id = data.get('productoId') or data.get('producto_id') or request.form.get('producto_id') or request.form.get('productoId')
            imagen_url = data.get('imagenUrl') or data.get('imagen') or request.form.get('imagen') or request.form.get('imagenUrl')

            try:
                producto_id = int(producto_id) if producto_id not in (None, '', 'None') else None
            except (TypeError, ValueError):
                producto_id = None

            imagen_final = None
            archivo_imagen = request.files.get('imagen') if request.files else None
            if archivo_imagen and getattr(archivo_imagen, 'filename', ''):
                nombre_archivo = guardar_imagen_subida(archivo_imagen)
                if nombre_archivo:
                    imagen_final = nombre_archivo
            elif imagen_url:
                imagen_final = normalizar_imagen(imagen_url)

            cursor.execute(
                "INSERT INTO carousel_items (titulo, imagen, producto_id, activo) VALUES (%s, %s, %s, 1)",
                (titulo, imagen_final, producto_id)
            )
            conn.commit()
            return jsonify({"message": "Item del carrusel agregado correctamente"}), 201

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/carousel/<int:item_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manejar_carrusel_item(item_id):
    claims = get_jwt()
    user = claims.get("user_data")
    if not user or user.get("role") != "admin":
        return jsonify({"error": "No autorizado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'PUT':
            data = request.get_json(silent=True) or {}
            titulo = (data.get('titulo') or request.form.get('titulo', '')) or ''
            producto_id = data.get('producto_id') or data.get('productoId') or request.form.get('producto_id') or request.form.get('productoId')
            imagen_url = data.get('imagenUrl') or data.get('imagen') or request.form.get('imagen') or request.form.get('imagenUrl')

            try:
                producto_id = int(producto_id) if producto_id not in (None, '', 'None') else None
            except (TypeError, ValueError):
                producto_id = None

            imagen_final = None
            archivo_imagen = request.files.get('imagen') if request.files else None
            if archivo_imagen and getattr(archivo_imagen, 'filename', ''):
                nombre_archivo = guardar_imagen_subida(archivo_imagen)
                if nombre_archivo:
                    imagen_final = nombre_archivo
            elif imagen_url is not None and imagen_url != '':
                imagen_final = normalizar_imagen(imagen_url)

            campos = []
            valores = []
            if titulo is not None:
                campos.append('titulo = %s')
                valores.append(titulo)
            if producto_id is not None:
                campos.append('producto_id = %s')
                valores.append(producto_id)
            if imagen_final is not None:
                campos.append('imagen = %s')
                valores.append(imagen_final)

            if campos:
                valores.append(item_id)
                cursor.execute(f"UPDATE carousel_items SET {', '.join(campos)} WHERE id = %s", tuple(valores))
            conn.commit()
            return jsonify({"message": "Slide actualizado correctamente"}), 200

        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM carousel_items WHERE id = %s", (item_id,))
            conn.commit()
            return jsonify({"message": "Slide eliminado"}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==============================================================================
# 7. ENDPOINTS DE PEDIDOS Y FACTURACIÓN
# ==============================================================================

@app.route('/api/pedido', methods=['POST'])
@jwt_required()
def crear_factura_y_pedido():
    claims = get_jwt()
    user_data = claims.get("user_data")

    if not user_data or "id" not in user_data:
        return jsonify({"error": "Token inválido"}), 401

    user_id = int(user_data["id"])
    data = request.json or {}

    if not data or 'carrito' not in data or len(data['carrito']) == 0:
        return jsonify({"error": "El carrito está vacío"}), 400

    fecha_entrega = (
        data.get('fecha_entrega') or 
        data.get('fechaEntrega') or 
        data.get('fecha_entrega_pactada')
    )

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        total_factura = 0.0
        items_procesados = []

        for item in data['carrito']:
            p_id = item.get('producto_id') or item.get('id')
            qty = item.get('unidades') or item.get('qty') or 1

            producto = obtener_o_crear_producto(
                conn,
                p_id,
                nombre=item.get('nombre') or item.get('producto_nombre'),
                precio=item.get('precio') or item.get('precio_unitario'),
                imagen=item.get('imagen'),
                cursor=cursor
            )

            if not producto:
                continue

            subtotal = float(producto['precio']) * int(qty)
            total_factura += subtotal

            items_procesados.append({
                "producto_id": int(producto['id']),
                "nombre_producto": producto['nombre'],
                "unidades": int(qty),
                "precio_unitario": float(producto['precio']),
                "total": subtotal
            })

        fecha_actual_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Una compra recién realizada NO descuenta stock ni se completa.
        # Queda pendiente hasta que el administrador pulse "Completar".
        cursor.execute("""
            INSERT INTO facturas (user_id, total, fecha, estado_factura)
            VALUES (%s, %s, %s, 'pendiente')
        """, (user_id, total_factura, fecha_actual_str))

        factura_id = cursor.lastrowid

        for item in items_procesados:
            cursor.execute("""
                INSERT INTO detalles_factura (factura_id, producto_id, unidades, precio_unitario, nombre_producto)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                factura_id,
                item['producto_id'],
                item['unidades'],
                item['precio_unitario'],
                item['nombre_producto']
            ))

            cursor.execute("""
                INSERT INTO pedidos (factura_id, user_id, producto_id, unidades, precio_unitario, total, fecha_pedido, fecha_entrega, prioridad, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'alta', 'Pendiente')
            """, (
                factura_id,
                user_id,
                item['producto_id'],
                item['unidades'],
                item['precio_unitario'],
                item['total'],
                fecha_actual_str,
                fecha_entrega
            ))

        conn.commit()
        return jsonify({"message": "¡Pedido y factura generados con éxito!", "factura_id": factura_id}), 201

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/facturas/manual', methods=['POST'])
@jwt_required()
def crear_factura_manual():
    claims = get_jwt()
    user_data = claims.get("user_data", {})
    if user_data.get("role") != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    data = request.json or {}
    nombre = (data.get('nombre') or '').strip()
    apellido = (data.get('apellido') or '').strip()
    email = (data.get('email') or '').strip().lower()
    items = data.get('items') or []
    tipo_venta = (data.get('tipo_venta') or 'presencial').strip().lower()
    notas = (data.get('notas') or '').strip()
    # Los registros manuales también nacen pendientes.
    # El stock solo cambia cuando el administrador los completa.
    estado_factura = (data.get('estado_factura') or 'pendiente').strip().lower()

    if not nombre or not email or not items:
        return jsonify({"error": "Faltan datos obligatorios: nombre, correo y al menos un producto"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        nombre_cliente = f"{nombre} {apellido}".strip() or nombre
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        usuario_existente = cursor.fetchone()

        if usuario_existente:
            user_id = usuario_existente['id']
        else:
            temp_password = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO usuarios (nombre, email, password, role, email_verificado) VALUES (%s, %s, %s, 'user', 1)",
                (nombre_cliente, email, generate_password_hash(temp_password))
            )
            conn.commit()
            user_id = cursor.lastrowid

        detalles_validos = []
        total_factura = 0.0
        for item in items:
            producto_id = item.get('producto_id')
            if producto_id in [None, '', 'None']:
                return jsonify({"error": "Cada línea debe referenciar un producto existente"}), 400

            try:
                producto_id = int(producto_id)
            except (TypeError, ValueError):
                return jsonify({"error": "El producto debe ser válido"}), 400

            cursor.execute("SELECT id, nombre, precio, stock FROM productos WHERE id = %s AND activo = 1", (producto_id,))
            producto = cursor.fetchone()
            if not producto:
                return jsonify({"error": f"El producto #{producto_id} no existe"}), 400

            unidades = int(item.get('unidades') or 1)
            if unidades <= 0:
                return jsonify({"error": "Las unidades deben ser mayores a cero"}), 400

            stock_actual = int(producto.get('stock') or 0)
            if estado_factura == 'completada' and stock_actual < unidades:
                return jsonify({"error": f"Stock insuficiente para {producto['nombre']}"}), 400

            precio_unitario = float(item.get('precio_unitario') or producto.get('precio') or 0)
            subtotal = round(precio_unitario * unidades, 2)
            total_factura += subtotal
            detalles_validos.append({
                "producto_id": producto_id,
                "nombre_producto": producto['nombre'],
                "unidades": unidades,
                "precio_unitario": precio_unitario,
                "descripcion": item.get('descripcion') or ''
            })

        fecha_actual_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("""
            INSERT INTO facturas (user_id, total, fecha, cliente_nombre, cliente_email, tipo_venta, notas, estado_factura)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, round(total_factura, 2), fecha_actual_str, nombre_cliente, email, tipo_venta, notas, estado_factura))
        factura_id = cursor.lastrowid

        for item in detalles_validos:
            cursor.execute("""
                INSERT INTO detalles_factura (factura_id, producto_id, unidades, precio_unitario, nombre_producto, descripcion)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (factura_id, item['producto_id'], item['unidades'], item['precio_unitario'], item['nombre_producto'], item['descripcion']))

        if estado_factura == 'completada':
            for item in detalles_validos:
                cursor.execute("UPDATE productos SET stock = GREATEST(0, stock - %s) WHERE id = %s", (item['unidades'], item['producto_id']))

        conn.commit()
        return jsonify({"message": "Factura creada correctamente", "factura_id": factura_id, "estado_factura": estado_factura}), 201
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/pedidos/<int:pedido_id>/completar', methods=['PATCH'])
@jwt_required()
def completar_pedido(pedido_id):
    """Completa un pedido antiguo de una sola línea y descuenta su stock una sola vez."""
    claims = get_jwt()
    user_data = claims.get("user_data", {})

    if user_data.get("role") != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        conn.start_transaction()

        cursor.execute("""
            SELECT id, producto_id, unidades, estado
            FROM pedidos
            WHERE id = %s
            FOR UPDATE
        """, (pedido_id,))
        pedido = cursor.fetchone()

        if not pedido:
            conn.rollback()
            return jsonify({"error": "Pedido no encontrado"}), 404

        if str(pedido.get('estado') or '').strip().lower() == 'completado':
            conn.rollback()
            return jsonify({
                "message": "Pedido ya estaba completado",
                "pedido_id": pedido_id,
                "estado": "Completado"
            }), 200

        producto_id = pedido.get('producto_id')
        unidades = int(pedido.get('unidades') or 0)

        if producto_id and unidades > 0:
            cursor.execute("""
                SELECT id, nombre, stock
                FROM productos
                WHERE id = %s
                FOR UPDATE
            """, (producto_id,))
            producto = cursor.fetchone()

            if not producto:
                conn.rollback()
                return jsonify({"error": f"El producto #{producto_id} no existe"}), 404

            stock_actual = int(producto.get('stock') or 0)
            if stock_actual < unidades:
                conn.rollback()
                return jsonify({
                    "error": f"Stock insuficiente para {producto['nombre']}. Disponible: {stock_actual}, solicitado: {unidades}."
                }), 409

            cursor.execute("""
                UPDATE productos
                SET stock = stock - %s
                WHERE id = %s
            """, (unidades, producto_id))

        cursor.execute("""
            UPDATE pedidos
            SET estado = 'Completado'
            WHERE id = %s
        """, (pedido_id,))

        conn.commit()

        return jsonify({
            "message": "Pedido marcado como completado y stock actualizado",
            "pedido_id": pedido_id,
            "estado": "Completado"
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/facturas/<int:factura_id>/completar', methods=['PATCH'])
@jwt_required()
def completar_registro_compra(factura_id):
    """
    Completa TODA la compra asociada a una factura.
    El stock se descuenta únicamente en este momento.
    """
    claims = get_jwt()
    user_data = claims.get("user_data", {})

    if user_data.get("role") != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        conn.start_transaction()

        # Bloqueamos la factura para impedir doble descuento si se pulsa
        # el botón dos veces casi al mismo tiempo.
        cursor.execute("""
            SELECT id, total, estado_factura
            FROM facturas
            WHERE id = %s
            FOR UPDATE
        """, (factura_id,))
        factura = cursor.fetchone()

        if not factura:
            conn.rollback()
            return jsonify({"error": "Registro de compra no encontrado"}), 404

        estado_actual = str(factura.get('estado_factura') or '').strip().lower()
        if estado_actual in ('completada', 'completed'):
            conn.rollback()
            return jsonify({
                "message": "Registro de compra ya estaba completado",
                "factura_id": factura_id,
                "estado": "Completado"
            }), 200

        # Preferimos pedidos porque son los registros de seguimiento de cada
        # producto. Si es una factura antigua sin pedidos, usamos sus detalles.
        cursor.execute("""
            SELECT id, producto_id, unidades
            FROM pedidos
            WHERE factura_id = %s
            ORDER BY id ASC
            FOR UPDATE
        """, (factura_id,))
        pedidos_factura = cursor.fetchall()

        if not pedidos_factura:
            cursor.execute("""
                SELECT producto_id, unidades
                FROM detalles_factura
                WHERE factura_id = %s
                ORDER BY id ASC
            """, (factura_id,))
            pedidos_factura = cursor.fetchall()

        if not pedidos_factura:
            conn.rollback()
            return jsonify({"error": "La compra no tiene productos asociados"}), 404

        # Agrupamos por producto. Si una misma compra tiene dos líneas del
        # mismo producto, se descuenta todo junto y no se pierde stock.
        unidades_por_producto = {}
        for item in pedidos_factura:
            producto_id = item.get('producto_id')
            unidades = int(item.get('unidades') or 0)

            if not producto_id or unidades <= 0:
                continue

            producto_id = int(producto_id)
            unidades_por_producto[producto_id] = (
                unidades_por_producto.get(producto_id, 0) + unidades
            )

        if not unidades_por_producto:
            conn.rollback()
            return jsonify({"error": "La compra no contiene unidades válidas"}), 400

        # Bloqueamos cada producto y validamos stock antes de tocar nada.
        productos_a_actualizar = []
        for producto_id, unidades in unidades_por_producto.items():
            cursor.execute("""
                SELECT id, nombre, stock
                FROM productos
                WHERE id = %s
                FOR UPDATE
            """, (producto_id,))
            producto = cursor.fetchone()

            if not producto:
                conn.rollback()
                return jsonify({"error": f"El producto #{producto_id} no existe"}), 404

            stock_actual = int(producto.get('stock') or 0)

            if stock_actual < unidades:
                conn.rollback()
                return jsonify({
                    "error": (
                        f"Stock insuficiente para {producto['nombre']}. "
                        f"Disponible: {stock_actual}, solicitado: {unidades}."
                    ),
                    "producto_id": producto_id,
                    "stock_actual": stock_actual,
                    "unidades_solicitadas": unidades
                }), 409

            productos_a_actualizar.append((producto_id, unidades))

        # Descuento de stock: este es el único punto donde una compra pasa
        # de pendiente a consumida en inventario.
        for producto_id, unidades in productos_a_actualizar:
            cursor.execute("""
                UPDATE productos
                SET stock = stock - %s
                WHERE id = %s
            """, (unidades, producto_id))

        cursor.execute("""
            UPDATE pedidos
            SET estado = 'Completado'
            WHERE factura_id = %s
        """, (factura_id,))

        cursor.execute("""
            UPDATE facturas
            SET estado_factura = 'completada'
            WHERE id = %s
        """, (factura_id,))

        conn.commit()

        return jsonify({
            "message": "Registro de compra completado y stock actualizado",
            "factura_id": factura_id,
            "estado": "Completado",
            "cantidad_pedidos": len(pedidos_factura),
            "stock_actualizado": [
                {"producto_id": producto_id, "unidades_descontadas": unidades}
                for producto_id, unidades in productos_a_actualizar
            ]
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/todos-pedidos', methods=['GET'])
@jwt_required()
def get_todos_pedidos():
    """Devuelve una tarjeta por compra. Los productos de una misma factura van juntos."""
    claims = get_jwt()
    user_data = claims.get("user_data", {})
    if user_data.get("role") != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT
                p.id AS pedido_id,
                p.factura_id,
                p.user_id,
                p.producto_id,
                p.unidades,
                p.precio_unitario,
                p.total,
                p.fecha_pedido,
                p.fecha_entrega,
                p.prioridad,
                p.estado,
                u.nombre AS nombre,
                u.email AS email,
                prod.nombre AS producto_nombre,
                prod.imagen AS imagen,
                prod.codigo AS codigo,
                prod.color AS color,
                prod.medida AS medida,
                f.total AS factura_total,
                f.fecha AS factura_fecha,
                f.estado_factura AS estado_factura
            FROM pedidos p
            JOIN usuarios u ON p.user_id = u.id
            LEFT JOIN productos prod ON p.producto_id = prod.id
            LEFT JOIN facturas f ON p.factura_id = f.id
            ORDER BY COALESCE(f.id, p.id) DESC, p.id ASC
        """
        cursor.execute(query)
        filas = cursor.fetchall()

        registros = []
        grupos = {}

        for p in filas:
            if p.get('factura_id') is not None:
                clave = ('factura', int(p['factura_id']))
            else:
                clave = ('pedido', int(p['pedido_id']))

            item = {
                'producto_id': p.get('producto_id'),
                'nombre': p.get('producto_nombre') or 'Producto',
                'codigo': p.get('codigo') or '',
                'imagen': normalizar_imagen(p.get('imagen')),
                'color': p.get('color'),
                'medida': p.get('medida'),
                'unidades': int(p.get('unidades') or 1),
                'precio_unitario': float(p.get('precio_unitario') or 0),
                'subtotal': float(p.get('total') or 0)
            }

            if clave not in grupos:
                registro = {
                    'id': int(p['factura_id']) if p.get('factura_id') is not None else int(p['pedido_id']),
                    'factura_id': int(p['factura_id']) if p.get('factura_id') is not None else None,
                    'pedido_id': int(p['pedido_id']),
                    'user_id': int(p['user_id']),
                    'nombre': p.get('nombre') or 'Cliente',
                    'email': p.get('email') or '',
                    'fecha_pedido': p.get('fecha_pedido'),
                    'fecha_entrega': p.get('fecha_entrega'),
                    'prioridad': p.get('prioridad'),
                    'estado': 'Pendiente',
                    'pedido': item['nombre'],
                    'unidades': item['unidades'],
                    'total': 0.0,
                    'items': []
                }
                grupos[clave] = registro
                registros.append(registro)

            registro = grupos[clave]
            registro['items'].append(item)
            registro['total'] = round(registro['total'] + item['subtotal'], 2)

            pedido_estado = str(p.get('estado') or 'pendiente').strip().lower()

            # El estado visible del registro se determina por los pedidos reales,
            # no por estado_factura. Una factura marcada como completada por una
            # edición antigua no puede ocultar un pedido que todavía está pendiente.
            if pedido_estado == 'completado':
                registro.setdefault('_estados_pedidos', []).append('completado')
            else:
                registro.setdefault('_estados_pedidos', []).append('pendiente')
                registro['estado'] = 'Pendiente'

        for registro in registros:
            estados = registro.pop('_estados_pedidos', [])
            # Una compra se considera completada únicamente cuando TODOS sus
            # pedidos están realmente en estado Completado.
            if estados and all(estado == 'completado' for estado in estados):
                registro['estado'] = 'Completado'
            else:
                registro['estado'] = 'Pendiente'

            registro['cantidad_productos'] = len(registro['items'])
            registro['cantidad_unidades'] = sum(int(i['unidades']) for i in registro['items'])
            if registro['items']:
                registro['pedido'] = registro['items'][0]['nombre']
                registro['unidades'] = registro['items'][0]['unidades']

        return jsonify(registros), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/mis-pedidos-usuario', methods=['GET'])
@jwt_required()
def mis_pedidos_usuario():
    claims = get_jwt()
    user_data = claims.get("user_data")
    if not user_data:
        return jsonify({"error": "No autorizado"}), 401

    user_id = int(user_data["id"])
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.id, p.user_id, COALESCE(prod.nombre, 'Producto') AS pedido,
                   p.unidades, p.total AS total_factura, p.fecha_pedido, p.fecha_entrega, p.estado
            FROM pedidos p
            LEFT JOIN productos prod ON prod.id = p.producto_id
            WHERE p.user_id = %s
            ORDER BY p.fecha_pedido DESC
        """, (user_id,))
        return jsonify(cursor.fetchall()), 200
    except Exception:
        return jsonify([]), 200
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/facturas', methods=['GET'])
@jwt_required()
def obtener_facturas():
    claims = get_jwt()
    user = claims.get("user_data")
    if not user or user.get("role") != "admin":
        return jsonify({"error": "No autorizado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT f.id, f.fecha, f.total,
                   COALESCE(f.cliente_nombre, u.nombre) as cliente_nombre,
                   COALESCE(f.cliente_email, u.email) as cliente_email,
                   f.tipo_venta,
                   f.notas,
                   f.estado_factura,
                   (SELECT df2.nombre_producto FROM detalles_factura df2 WHERE df2.factura_id = f.id ORDER BY df2.id LIMIT 1) as producto,
                   (SELECT df2.unidades FROM detalles_factura df2 WHERE df2.factura_id = f.id ORDER BY df2.id LIMIT 1) as unidades
            FROM facturas f
            LEFT JOIN usuarios u ON f.user_id = u.id
            ORDER BY f.id DESC
        """)
        facturas = cursor.fetchall()
        for f in facturas:
            f['total'] = float(f['total'])
        return jsonify(facturas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/facturas/<int:factura_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def detalle_factura(factura_id):
    claims = get_jwt()
    user = claims.get("user_data")

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            cursor.execute("""
                SELECT f.id, f.fecha, f.total,
                       COALESCE(f.cliente_nombre, u.nombre) as cliente_nombre,
                       COALESCE(f.cliente_email, u.email) as cliente_email,
                       f.tipo_venta,
                       f.notas,
                       f.estado_factura
                FROM facturas f
                LEFT JOIN usuarios u ON f.user_id = u.id
                WHERE f.id = %s
            """, (factura_id,))
            factura = cursor.fetchone()

            if not factura:
                return jsonify({"error": "Factura no encontrada"}), 404

            cursor.execute("""
                SELECT
                    df.producto_id,
                    df.unidades,
                    df.precio_unitario,
                    df.nombre_producto,
                    df.descripcion,
                    prod.codigo,
                    prod.imagen,
                    prod.color,
                    prod.medida
                FROM detalles_factura df
                LEFT JOIN productos prod ON prod.id = df.producto_id
                WHERE df.factura_id = %s
                ORDER BY df.id ASC
            """, (factura_id,))
            detalles = cursor.fetchall()

            factura['total'] = float(factura['total'])
            for item in detalles:
                unidades = int(item.get('unidades') or 1)
                precio_unitario = float(item.get('precio_unitario') or 0)
                item['unidades'] = unidades
                item['precio_unitario'] = precio_unitario
                item['producto'] = item.get('nombre_producto') or 'Artículo general'
                item['nombre'] = item['producto']
                item['codigo'] = item.get('codigo') or ''
                item['imagen'] = normalizar_imagen(item.get('imagen'))
                item['color'] = item.get('color') or ''
                item['medida'] = item.get('medida') or ''
                item['subtotal'] = round(precio_unitario * unidades, 2)
                item['descripcion'] = item.get('descripcion') or ''

            factura['items'] = detalles
            return jsonify(factura), 200

        elif request.method == 'PUT':
            if user.get("role") != "admin":
                return jsonify({"error": "No autorizado"}), 403

            data = request.json or {}
            nombre = (data.get('nombre') or '').strip()
            apellido = (data.get('apellido') or '').strip()
            email = (data.get('email') or '').strip().lower()
            items = data.get('items') or []
            tipo_venta = (data.get('tipo_venta') or 'presencial').strip().lower()
            notas = (data.get('notas') or '').strip()
            estado_factura = None
            # Editar una factura NO debe completar el pedido ni descontar stock.
            # El único flujo que puede pasar a completada es /completar.
            cursor.execute("SELECT estado_factura FROM facturas WHERE id = %s FOR UPDATE", (factura_id,))
            factura_actual = cursor.fetchone()
            if not factura_actual:
                return jsonify({"error": "Factura no encontrada"}), 404
            estado_factura = str(factura_actual.get('estado_factura') or 'pendiente').strip().lower()
            if estado_factura not in ('pendiente', 'completada', 'completed'):
                estado_factura = 'pendiente'

            if not nombre or not email or not items:
                return jsonify({"error": "Faltan datos obligatorios para editar la factura"}), 400

            detalles_validos = []
            total_factura = 0.0
            for item in items:
                producto_id = item.get('producto_id')
                if producto_id in [None, '', 'None']:
                    return jsonify({"error": "Cada línea debe referenciar un producto existente"}), 400

                try:
                    producto_id = int(producto_id)
                except (TypeError, ValueError):
                    return jsonify({"error": "El producto debe ser válido"}), 400

                cursor.execute("SELECT id, nombre, precio, stock FROM productos WHERE id = %s AND activo = 1", (producto_id,))
                producto = cursor.fetchone()
                if not producto:
                    return jsonify({"error": f"El producto #{producto_id} no existe"}), 400

                unidades = int(item.get('unidades') or 1)
                if unidades <= 0:
                    return jsonify({"error": "Las unidades deben ser mayores a cero"}), 400

                stock_actual = int(producto.get('stock') or 0)
                if estado_factura == 'completada' and stock_actual < unidades:
                    return jsonify({"error": f"Stock insuficiente para {producto['nombre']}"}), 400

                precio_unitario = float(item.get('precio_unitario') or producto.get('precio') or 0)
                subtotal = round(precio_unitario * unidades, 2)
                total_factura += subtotal
                detalles_validos.append({
                    "producto_id": producto_id,
                    "nombre_producto": producto['nombre'],
                    "unidades": unidades,
                    "precio_unitario": precio_unitario,
                    "descripcion": item.get('descripcion') or ''
                })

            nombre_cliente = f"{nombre} {apellido}".strip() or nombre
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
            usuario_existente = cursor.fetchone()
            if usuario_existente:
                user_id = usuario_existente['id']
            else:
                temp_password = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO usuarios (nombre, email, password, role, email_verificado) VALUES (%s, %s, %s, 'user', 1)",
                    (nombre_cliente, email, generate_password_hash(temp_password))
                )
                conn.commit()
                user_id = cursor.lastrowid

            cursor.execute("""
                UPDATE facturas
                SET user_id = %s,
                    total = %s,
                    cliente_nombre = %s,
                    cliente_email = %s,
                    tipo_venta = %s,
                    notas = %s,
                    estado_factura = %s
                WHERE id = %s
            """, (user_id, round(total_factura, 2), nombre_cliente, email, tipo_venta, notas, estado_factura, factura_id))

            cursor.execute("DELETE FROM detalles_factura WHERE factura_id = %s", (factura_id,))
            for item in detalles_validos:
                cursor.execute("""
                    INSERT INTO detalles_factura (factura_id, producto_id, unidades, precio_unitario, nombre_producto, descripcion)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (factura_id, item['producto_id'], item['unidades'], item['precio_unitario'], item['nombre_producto'], item['descripcion']))

            # IMPORTANTE: editar una factura nunca modifica el stock.
            # El stock y el estado se cambian exclusivamente desde
            # /api/facturas/<id>/completar.

            # Si el registro sigue pendiente, sus pedidos también deben seguir
            # pendientes. Esto evita que una edición de factura los complete.
            if estado_factura == 'pendiente':
                cursor.execute("UPDATE pedidos SET estado = 'Pendiente' WHERE factura_id = %s", (factura_id,))

            conn.commit()
            return jsonify({"message": "Factura actualizada correctamente"}), 200

        elif request.method == 'DELETE':
            if user.get("role") != "admin":
                return jsonify({"error": "No autorizado"}), 403

            cursor.execute("DELETE FROM facturas WHERE id = %s", (factura_id,))
            conn.commit()
            return jsonify({"message": "Factura eliminada"}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==============================================================================
# 8. ENDPOINT DE ESTADÍSTICAS DEL PANEL ADMIN
# ==============================================================================

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    claims = get_jwt()
    user = claims.get("user_data")
    if not user or user.get("role") != "admin":
        return jsonify({"error": "No autorizado"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        estado_completo = "('completada', 'completed')"

        cursor.execute("SELECT COUNT(*) as total_usuarios FROM usuarios WHERE role = 'user'")
        total_usuarios = int((cursor.fetchone() or {}).get('total_usuarios') or 0)

        cursor.execute("SELECT COUNT(*) as total_pedidos FROM pedidos")
        total_pedidos = int((cursor.fetchone() or {}).get('total_pedidos') or 0)

        cursor.execute("""
            SELECT COALESCE(SUM(df.unidades), 0) as total_unidades
            FROM detalles_factura df
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
        """)
        total_ventas = int((cursor.fetchone() or {}).get('total_unidades') or 0)

        cursor.execute("SELECT COUNT(*) as total_productos FROM productos WHERE activo = 1")
        total_productos = int((cursor.fetchone() or {}).get('total_productos') or 0)

        cursor.execute("""
            SELECT COALESCE(SUM(df.unidades), 0) as total_unidades_semana
            FROM detalles_factura df
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
              AND f.fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        """)
        ventas_semana = int((cursor.fetchone() or {}).get('total_unidades_semana') or 0)

        cursor.execute("""
            SELECT COALESCE(SUM(df.unidades), 0) as total_unidades_mes
            FROM detalles_factura df
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
              AND DATE_FORMAT(f.fecha, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
        """)
        ventas_mes = int((cursor.fetchone() or {}).get('total_unidades_mes') or 0)

        cursor.execute("""
            SELECT COALESCE(SUM(df.unidades), 0) as total_unidades_anio
            FROM detalles_factura df
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
              AND YEAR(f.fecha) = YEAR(CURDATE())
        """)
        ventas_anio = int((cursor.fetchone() or {}).get('total_unidades_anio') or 0)

        cursor.execute("""
            SELECT DATE_FORMAT(f.fecha, '%Y-%m') AS mes,
                   SUM(df.unidades) AS total
            FROM detalles_factura df
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
            GROUP BY DATE_FORMAT(f.fecha, '%Y-%m')
            ORDER BY mes DESC
            LIMIT 12
        """)
        ventas_por_mes_rows = cursor.fetchall() or []
        ventas_por_mes = []
        for row in ventas_por_mes_rows:
            mes = row.get('mes') or ''
            ventas_por_mes.append({
                'label': mes,
                'mes_label': datetime.strptime(f"{mes}-01", '%Y-%m-%d').strftime('%b %Y') if mes else 'Sin dato',
                'total': int(row.get('total') or 0)
            })
        ventas_por_mes.reverse()

        mes_mas_vendido = {'label': 'Sin datos', 'total': 0}
        if ventas_por_mes:
            mes_mas_vendido = {"label": ventas_por_mes[0]['mes_label'], "total": int(ventas_por_mes[0]['total'])}
            if len(ventas_por_mes) > 1:
                for item in ventas_por_mes:
                    if int(item['total']) > int(mes_mas_vendido['total']):
                        mes_mas_vendido = {'label': item['mes_label'], 'total': int(item['total'])}

        cursor.execute("""
            SELECT DATE_FORMAT(f.fecha, '%Y-%u') AS semana,
                   SUM(df.unidades) AS total
            FROM detalles_factura df
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
            GROUP BY DATE_FORMAT(f.fecha, '%Y-%u')
            ORDER BY semana DESC
            LIMIT 8
        """)
        ventas_por_semana_rows = cursor.fetchall() or []
        ventas_por_semana = []
        for row in ventas_por_semana_rows:
            semana = row.get('semana') or ''
            ventas_por_semana.append({
                'label': f"Sem {semana.split('-')[1]}" if semana else 'Sin dato',
                'total': int(row.get('total') or 0)
            })
        ventas_por_semana.reverse()

        cursor.execute("""
            SELECT df.producto_id,
                   p.nombre,
                   COALESCE(p.codigo, '') AS codigo,
                   COALESCE(p.color, '') AS color,
                   SUM(df.unidades) AS unidades_vendidas,
                   SUM(df.unidades * df.precio_unitario) AS total_recaudado
            FROM detalles_factura df
            JOIN productos p ON p.id = df.producto_id
            JOIN facturas f ON f.id = df.factura_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
            GROUP BY df.producto_id, p.nombre, p.codigo, p.color
            ORDER BY unidades_vendidas DESC, total_recaudado DESC
            LIMIT 5
        """)
        productos_mas_vendidos = []
        for row in cursor.fetchall() or []:
            productos_mas_vendidos.append({
                'producto_id': row.get('producto_id'),
                'nombre': row.get('nombre') or 'Producto',
                'codigo': row.get('codigo') or 'Sin código',
                'color': row.get('color') or 'Sin color',
                'unidades_vendidas': int(row.get('unidades_vendidas') or 0),
                'total_recaudado': float(row.get('total_recaudado') or 0)
            })

        cursor.execute("""
            SELECT COALESCE(p.color, 'Sin color') AS color,
                   SUM(df.unidades) AS unidades_vendidas
            FROM detalles_factura df
            JOIN productos p ON p.id = df.producto_id
            JOIN facturas f ON f.id = df.factura_id
            WHERE p.color IS NOT NULL
              AND TRIM(p.color) <> ''
              AND LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
            GROUP BY p.color
            ORDER BY unidades_vendidas DESC
            LIMIT 6
        """)
        colores_mas_vendidos = [
            {
                'color': row.get('color') or 'Sin color',
                'unidades_vendidas': int(row.get('unidades_vendidas') or 0)
            }
            for row in (cursor.fetchall() or [])
        ]

        cursor.execute("""
            SELECT u.id,
                   COALESCE(u.nombre, 'Usuario') AS nombre,
                   u.email,
                   COUNT(DISTINCT f.id) AS compras_realizadas,
                   COALESCE(SUM(f.total), 0) AS total_gastado
            FROM facturas f
            JOIN usuarios u ON u.id = f.user_id
            WHERE LOWER(COALESCE(f.estado_factura, 'completada')) IN ('completada', 'completed')
            GROUP BY u.id, u.nombre, u.email
            ORDER BY compras_realizadas DESC, total_gastado DESC
            LIMIT 5
        """)
        usuarios_mas_compraron = [
            {
                'id': row.get('id'),
                'nombre': row.get('nombre') or 'Usuario',
                'email': row.get('email') or 'Sin email',
                'compras_realizadas': int(row.get('compras_realizadas') or 0),
                'total_gastado': float(row.get('total_gastado') or 0)
            }
            for row in (cursor.fetchall() or [])
        ]

        return jsonify({
            "total_usuarios": total_usuarios,
            "total_pedidos": total_pedidos,
            "total_ventas": round(total_ventas, 2),
            "total_productos": total_productos,
            "ventas_semana": round(ventas_semana, 2),
            "ventas_mes": round(ventas_mes, 2),
            "ventas_anio": round(ventas_anio, 2),
            "mes_mas_vendido": mes_mas_vendido,
            "ventas_por_mes": ventas_por_mes,
            "ventas_por_semana": ventas_por_semana,
            "productos_mas_vendidos": productos_mas_vendidos,
            "colores_mas_vendidos": colores_mas_vendidos,
            "usuarios_mas_compraron": usuarios_mas_compraron
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==============================================================================
# 9. MANEJO DE ERRORES Y EJECUCIÓN DEL SERVIDOR
# ==============================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Ruta no encontrada"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Error interno del servidor"}), 500


if __name__ == '__main__':
    print("🚀 Servidor Beta Gráfica ejecutándose en http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)