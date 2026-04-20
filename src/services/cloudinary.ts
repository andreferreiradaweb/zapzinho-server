import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import { env } from '@/config/validatedEnv'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  buffer: Buffer,
  resourceType: 'image' | 'video' | 'raw',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload falhou'))
        resolve(result.secure_url)
      },
    )
    Readable.from(buffer).pipe(stream)
  })
}

export async function deleteFromCloudinary(url: string): Promise<void> {
  const publicId = extractPublicId(url)
  if (!publicId) return

  // Tenta como image primeiro, depois como video
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })
    if (res.result !== 'ok') {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
    }
  } catch {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
    } catch {
      // silencia — arquivo pode já não existir
    }
  }
}

export async function deleteManyFromCloudinary(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map(deleteFromCloudinary))
}

function extractPublicId(url: string): string | null {
  // https://res.cloudinary.com/<cloud>/image/upload/v123/<publicId>.<ext>
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.\w+)?$/)
  return match ? match[1] : null
}
