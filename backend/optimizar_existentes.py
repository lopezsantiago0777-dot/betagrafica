import os
from PIL import Image, ImageOps

# ============================================================
# CONFIGURACIÓN
# ============================================================

# Proyecto Vue
CARPETA_IMAGENES = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "vue-project",
    "public",
    "imagenes"
)

# Tamaños utilizados por los componentes Vue
TAMANOS = [400, 800, 1200]

# Calidad de salida
CALIDAD_WEBP = 80
CALIDAD_AVIF = 65


# ============================================================
# VERIFICAR CARPETA
# ============================================================

print("=" * 60)
print("OPTIMIZADOR DE IMÁGENES - VUE")
print("=" * 60)
print()

print(f"Carpeta de imágenes:")
print(CARPETA_IMAGENES)
print()

if not os.path.exists(CARPETA_IMAGENES):
    print("ERROR: No se encontró la carpeta de imágenes.")
    print()
    print("La ruta esperada es:")
    print(CARPETA_IMAGENES)
    print()
    input("Presioná ENTER para salir...")
    raise SystemExit(1)


# ============================================================
# EXTENSIONES DE IMÁGENES ORIGINALES
# ============================================================

EXTENSIONES = (
    ".jpg",
    ".jpeg",
    ".png"
)


# ============================================================
# BUSCAR IMÁGENES
# ============================================================

archivos = []

for filename in os.listdir(CARPETA_IMAGENES):

    # Ignorar versiones optimizadas
    if (
        "-400." in filename
        or "-800." in filename
        or "-1200." in filename
    ):
        continue

    # Solo imágenes originales
    if filename.lower().endswith(EXTENSIONES):
        archivos.append(filename)


if not archivos:
    print("No se encontraron imágenes originales.")
    print()
    input("Presioná ENTER para salir...")
    raise SystemExit(0)


print(f"Imágenes encontradas: {len(archivos)}")
print()


# ============================================================
# CONTADORES
# ============================================================

contador_webp = 0
contador_avif = 0
errores = 0


# ============================================================
# PROCESAR IMÁGENES
# ============================================================

for filename in archivos:

    filepath = os.path.join(
        CARPETA_IMAGENES,
        filename
    )

    nombre_base = os.path.splitext(filename)[0]

    print("-" * 60)
    print(f"Procesando: {filename}")

    try:

        with Image.open(filepath) as img:

            # ------------------------------------------------
            # Corregir orientación EXIF
            # ------------------------------------------------

            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass


            # ------------------------------------------------
            # Convertir a RGB
            # ------------------------------------------------

            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")


            ancho_original, alto_original = img.size

            print(
                f"  Original: "
                f"{ancho_original}x{alto_original}"
            )


            # ------------------------------------------------
            # GENERAR 400 / 800 / 1200
            # ------------------------------------------------

            for tamano in TAMANOS:

                # No agrandar imágenes que ya son pequeñas
                if ancho_original <= tamano:

                    nueva_imagen = img.copy()

                else:

                    proporcion = tamano / ancho_original

                    nuevo_ancho = tamano
                    nuevo_alto = round(
                        alto_original * proporcion
                    )

                    nueva_imagen = img.resize(
                        (nuevo_ancho, nuevo_alto),
                        Image.Resampling.LANCZOS
                    )


                # ====================================================
                # WEBP
                # ====================================================

                nombre_webp = (
                    f"{nombre_base}-{tamano}.webp"
                )

                ruta_webp = os.path.join(
                    CARPETA_IMAGENES,
                    nombre_webp
                )

                try:

                    nueva_imagen.save(
                        ruta_webp,
                        "WEBP",
                        quality=CALIDAD_WEBP,
                        method=6
                    )

                    contador_webp += 1

                    print(
                        f"  OK WEBP: {nombre_webp}"
                    )

                except Exception as e:

                    print(
                        f"  ERROR WEBP: {e}"
                    )

                    errores += 1


                # ====================================================
                # AVIF
                # ====================================================

                nombre_avif = (
                    f"{nombre_base}-{tamano}.avif"
                )

                ruta_avif = os.path.join(
                    CARPETA_IMAGENES,
                    nombre_avif
                )

                try:

                    nueva_imagen.save(
                        ruta_avif,
                        "AVIF",
                        quality=CALIDAD_AVIF
                    )

                    contador_avif += 1

                    print(
                        f"  OK AVIF: {nombre_avif}"
                    )

                except Exception as e:

                    print(
                        f"  ERROR AVIF: {e}"
                    )

                    errores += 1


                # Liberar imagen temporal
                nueva_imagen.close()


    except Exception as e:

        print(
            f"  ERROR procesando {filename}: {e}"
        )

        errores += 1


# ============================================================
# RESUMEN
# ============================================================

print()
print("=" * 60)
print("OPTIMIZACIÓN TERMINADA")
print("=" * 60)
print()

print(
    f"Imágenes originales procesadas: "
    f"{len(archivos)}"
)

print(
    f"Archivos WEBP generados: "
    f"{contador_webp}"
)

print(
    f"Archivos AVIF generados: "
    f"{contador_avif}"
)

print(
    f"Errores: "
    f"{errores}"
)

print()
print("IMPORTANTE:")
print("Las imágenes originales NO fueron modificadas.")
print("Las imágenes originales NO fueron eliminadas.")
print()

input("Presioná ENTER para cerrar...")