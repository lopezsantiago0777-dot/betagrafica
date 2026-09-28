# Inicialización de Base de Datos (Opcional)

Si tienes un volcado existente de MySQL (archivo `.sql` o `.sql.gz`), colócalo en esta carpeta.
MySQL ejecutará automáticamente los archivos `.sql` aquí contenidos **únicamente la primera vez** que se cree el volumen de datos de MySQL.

Si dejas la carpeta vacía, la aplicación Flask creará automáticamente todas las tablas (`usuarios`, `productos`, `pedidos`, `facturas`, etc.) al arrancar.
