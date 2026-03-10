export type UploadSuccessResponse = {
  success: true
  message: string
  path: string
  url: string
  filename: string
  size: number
}

export type UploadValidationErrorResponse = {
  success: false
  message: string
  errors: Record<string, string[]>
}

export type UploadServerErrorResponse = {
  success: false
  message: string
}
