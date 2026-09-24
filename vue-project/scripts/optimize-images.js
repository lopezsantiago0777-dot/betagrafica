import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Use current working directory (project root) to locate public/imagenes reliably
const normalizedImagesDir = path.join(process.cwd(), 'public', 'imagenes')

const sizes = [400, 800, 1200]

async function optimizeFile(file) {
  const ext = path.extname(file).toLowerCase()
  if (!['.jpg', '.jpeg', '.png', '.tif', '.tiff'].includes(ext)) return

  const name = path.basename(file, ext)
  const inputPath = path.join(normalizedImagesDir, file)

  for (const width of sizes) {
    const webpOut = path.join(normalizedImagesDir, `${name}-${width}.webp`)
    const avifOut = path.join(normalizedImagesDir, `${name}-${width}.avif`)

    try {
      await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpOut)

      await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 60 })
        .toFile(avifOut)

      console.log(`Created: ${path.basename(webpOut)}, ${path.basename(avifOut)}`)
    } catch (err) {
      console.error(`Failed to process ${file} at width ${width}:`, err.message)
    }
  }
}

async function run() {
  try {
    // Ensure directory exists
    await fs.promises.access(normalizedImagesDir)
    const files = await fs.promises.readdir(normalizedImagesDir)
    const images = files.filter(f => !f.endsWith('.webp') && !f.endsWith('.avif'))
    for (const file of images) {
      await optimizeFile(file)
    }
    console.log('Image optimization complete.')
  } catch (err) {
    console.error('Error reading images directory:', err.message)
    process.exit(1)
  }
}

run()
