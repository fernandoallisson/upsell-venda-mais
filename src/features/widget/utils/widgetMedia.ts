export const isVideoUrl = (url: string): boolean => {
  const value = url.trim().toLowerCase()
  if (!value) return false

  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/.test(value)
    || value.includes('youtube.com/')
    || value.includes('youtu.be/')
    || value.includes('vimeo.com/')
}
