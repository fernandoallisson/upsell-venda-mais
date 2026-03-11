import { apiUpload } from '../../api'
import type { UploadSuccessResponse } from './uploads.types'

const uploadFile = (
  endpoint: string,
  fieldName: string,
  file: File,
): Promise<UploadSuccessResponse> => {
  const formData = new FormData()
  formData.append(fieldName, file)
  return apiUpload<UploadSuccessResponse>(endpoint, formData)
}

export const uploadImage = (file: File) =>
  uploadFile('/v1/uploads/image', 'image', file)

export const uploadVideo = (file: File) =>
  uploadFile('/v1/uploads/video', 'video', file)
