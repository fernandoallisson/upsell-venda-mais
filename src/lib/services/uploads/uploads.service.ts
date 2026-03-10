import { ApiError } from '../../api'
import { getAuthToken } from '../../storage'
import type { UploadSuccessResponse } from './uploads.types'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'

const uploadFile = async (
  endpoint: string,
  fieldName: string,
  file: File,
): Promise<UploadSuccessResponse> => {
  const token = getAuthToken()
  if (!token) {
    throw new ApiError('Nao autenticado', 401)
  }

  const formData = new FormData()
  formData.append(fieldName, file)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    })
  } catch {
    throw new ApiError('Falha de rede ao enviar arquivo')
  }

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 422 && data.errors) {
      const errors = data.errors as Record<string, string[]>
      const firstKey = Object.keys(errors)[0]
      const firstMsg = firstKey ? errors[firstKey]?.[0] : undefined
      throw new ApiError(firstMsg ?? data.message ?? 'Erro de validacao', 422)
    }
    throw new ApiError(data.message ?? 'Erro ao enviar arquivo', response.status)
  }

  return data as UploadSuccessResponse
}

export const uploadImage = (file: File) =>
  uploadFile('/v1/uploads/image', 'image', file)

export const uploadVideo = (file: File) =>
  uploadFile('/v1/uploads/video', 'video', file)
