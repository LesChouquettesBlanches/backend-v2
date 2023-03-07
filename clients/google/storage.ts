import { v4 as uuid } from 'uuid'
import { Storage } from '@google-cloud/storage'

import { format } from 'util'

const storage = new Storage({ keyFilename: process.env.GOOGLE_APP_CREDENTIALS })
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME)

export const uploadToStore = async (folder, file) => {
  try {
    const uniqueName = `${uuid()}.${file.originalname.split('.').pop()}`
    const fileName = folder + uniqueName
    const blob = bucket.file(fileName)
    const blobStream = blob.createWriteStream({
      resumable: false,
    })

    blobStream.on('error', (err) => {
      console.log(err)
      return { success: false, error: 'Internal error on stream' }
    })

    blobStream.on('finish', async () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
      )

      try {
        await bucket.file(fileName).makePublic()
      } catch (e) {
        console.log(e)
        return { success: false, error: 'PUBLIC_ACCESS_DENIED' }
      }

      return { success: true, publicUrl, fileName }
    })

    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
    )

    blobStream.end(file.buffer)
    return { success: true, publicUrl, fileName }
  } catch (err) {
    console.log(err)

    if (err.code === 'LIMIT_FILE_SIZE') {
      return {
        success: false,
        error: 'File size cannot be larger than 10MB!',
      }
    }

    return { success: false, error: 'Internal error' }
  }
}

export const deleteFromStore = async (fileName) => {
  if (fileName !== undefined && fileName.length > 0) {
    await bucket.file(fileName).delete()
    return true
  }
  return false
}
