import { ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  filename: string
  originalFilename: string
  s3Key: string
  uploadedAt: string
  faces?: Face[]
  matches?: PhotoMatch[]
}

export interface Face {
  id: string
  faceId: string
  boundingBox: BoundingBox
  confidence: number
  landmarks?: FaceLandmark[]
}

export interface BoundingBox {
  Width: number
  Height: number
  Left: number
  Top: number
}

export interface FaceLandmark {
  Type: string
  X: number
  Y: number
}

export interface PhotoMatch {
  id: string
  photoId: string
  userId: string
  faceId: string
  confidence: number
  user?: User
}

export interface UploadResponse {
  success: boolean
  message: string
  data?: {
    photo: Photo
    matches: PhotoMatch[]
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ComponentProps {
  className?: string
  children?: ReactNode
}

// Gallery specific types
export type GalleryFilter = 'all'

export interface GalleryPhoto {
  id: string
  filename: string
  originalFilename: string
  s3Key: string
  uploadedAt: string
  thumbnailUrl: string
  downloadUrl: string
  width?: number
  height?: number
  isEnhanced: boolean
  isFavorite: boolean
  confidence: number
}

export interface GalleryEvent {
  id: string
  name: string
  description?: string
  status: string
  start_time?: string
  end_time?: string
  location?: string
  banner?: {
    id: string
    filename: string
    url: string
    width: number
    height: number
  }
}

export interface GalleryResponse {
  photos: GalleryPhoto[]
  user: {
    name: string
    totalPhotos: number
  }
  event?: GalleryEvent | null
  retentionDays: number
} 