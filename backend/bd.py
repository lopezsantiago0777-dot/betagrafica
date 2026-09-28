from flask import Flask, request, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
import mysql.connector

app = Flask(__name__)
CORS(app)  # Permite que tu app de Vue se conecte sin bloqueos de seguridad

import os

# Configuración de la conexión a MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "betagrafica")
    )