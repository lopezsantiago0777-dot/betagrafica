from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # Permite que tu app de Vue se conecte sin bloqueos de seguridad

# Configuración de la conexión a XAMPP MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",      # Usuario por defecto de XAMPP
        password="",      # Contraseña por defecto de XAMPP (vacía)
        database="betagrafica"
    )