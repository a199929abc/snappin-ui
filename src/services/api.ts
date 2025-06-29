// Types for API requests and responses
export interface RegisterRequest {
  name: string
  email: string
  phone?: string
  instagram?: string
  photo: File // Changed from base64 string to File object
  serviceConsent?: boolean
}

export interface RegisterResponse {
  user_id?: string
  message: string
}

// OTP related types
export interface SendOTPRequest {
  email: string
  purpose?: string
}

export interface SendOTPResponse {
  message: string
  expires_in: number
  rate_limit: {
    window_seconds: number
    max_attempts: number
  }
}

export interface VerifyOTPRequest {
  email: string
  code: string
  purpose?: string
}

export interface VerifyOTPResponse {
  message: string
  verified_at: string
  purpose: string
}

export interface OTPStatusResponse {
  exists: boolean
  expires_in?: number
  attempts_used?: number
  attempts_remaining?: number
  created_at?: string
  purpose?: string
  message?: string
}

// Event registration types
export interface EventInfo {
  id: string
  name: string
  description: string
  slug: string
  start_time?: string
  end_time?: string
  location?: string
  max_participants?: number
  current_participants: number
  registration_deadline?: string
  is_full: boolean
  banner?: {
    id: string
    filename: string
    url: string
    width: number
    height: number
  }
}

export interface EventRegistrationResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    phone?: string
  }
  photo: {
    id: string
    url: string
    face_id: string
  }
  event: {
    id: string
    name: string
    slug: string
  }
}

// Gallery related types
export interface GalleryRequest {
  code: string
  filter?: 'all' | 'enhanced' | 'favorites'
}

export interface GalleryResponse {
  photos: Array<{
    id: string
    filename: string
    originalFilename: string
    s3Key: string
    uploadedAt: string
    thumbnailUrl: string
    downloadUrl: string
    width: number
    height: number
    isEnhanced: boolean
    isFavorite: boolean
    confidence: number
  }>
  user: {
    name: string
    totalPhotos: number
  }
  event?: {
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
  } | null
  retentionDays: number
}

export interface DownloadRequest {
  photoIds: string[]
  format?: 'original' | 'compressed'
}

export interface ShareRequest {
  photoIds: string[]
  platform?: 'link' | 'email'
}

// API service class
class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  }

  // OTP methods
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await fetch(`${this.baseUrl}/api/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        purpose: data.purpose || 'email_verification',
      }),
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      let errorMessage = `Failed to send verification code: ${response.status}`
      
      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        errorMessage = result.messages[0]
      } else if (result.error) {
        errorMessage = result.error
      } else if (result.message) {
        errorMessage = result.message
      }
      
      throw new Error(errorMessage)
    }
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await fetch(`${this.baseUrl}/api/otp`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        code: data.code,
        purpose: data.purpose || 'email_verification',
      }),
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      let errorMessage = `Verification failed: ${response.status}`
      
      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        errorMessage = result.messages[0]
      } else if (result.error) {
        errorMessage = result.error
      } else if (result.message) {
        errorMessage = result.message
      }
      
      throw new Error(errorMessage)
    }
  }

  async getOTPStatus(email: string, purpose: string = 'email_verification'): Promise<OTPStatusResponse> {
    const params = new URLSearchParams({
      email,
      purpose,
    })

    const response = await fetch(`${this.baseUrl}/api/otp?${params}`, {
      method: 'GET',
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      let errorMessage = `Failed to get verification status: ${response.status}`
      
      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        errorMessage = result.messages[0]
      } else if (result.error) {
        errorMessage = result.error
      } else if (result.message) {
        errorMessage = result.message
      }
      
      throw new Error(errorMessage)
    }
  }

  // Legacy registration method (kept for backward compatibility)
  async registerWithPhoto(data: RegisterRequest): Promise<RegisterResponse> {
    // Create FormData
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    if (data.phone) {
      formData.append('phone', data.phone)
    }
    if (data.instagram) {
      formData.append('instagram', data.instagram)
    }
    if (data.serviceConsent !== undefined) {
      formData.append('serviceConsent', data.serviceConsent.toString())
    }
    formData.append('photo', data.photo)

    const response = await fetch(`${this.baseUrl}/api/register-with-photo`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    // Standard way: success returns data, failure throws error
    if (response.ok) {
      // HTTP 200-299 = success, return data directly
      return {
        user_id: result.user_id,
        message: result.message || 'Registration successful',
      }
    } else {
      // Handle structured error response from backend
      let errorMessage = `Server error: ${response.status}`
      
      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        errorMessage = result.messages[0]
      } else if (result.error) {
        errorMessage = result.error
      } else if (result.message) {
        errorMessage = result.message
      }
      
      throw new Error(errorMessage)
    }
  }

  // New event-based registration method
  async registerForEvent(eventSlug: string, data: RegisterRequest): Promise<EventRegistrationResponse> {
    // Create FormData
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    if (data.phone) {
      formData.append('phone', data.phone)
    }
    if (data.instagram) {
      formData.append('instagram', data.instagram)
    }
    if (data.serviceConsent !== undefined) {
      formData.append('serviceConsent', data.serviceConsent.toString())
    }
    formData.append('photo', data.photo)

    const response = await fetch(`${this.baseUrl}/event/${eventSlug}/register`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      // Handle structured error response from backend
      let errorMessage = `Registration failed: ${response.status}`
      
      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        errorMessage = result.messages[0]
      } else if (result.error) {
        errorMessage = result.error
      } else if (result.message) {
        errorMessage = result.message
      }
      
      throw new Error(errorMessage)
    }
  }

  // Get event registration info
  async getEventInfo(eventSlug: string): Promise<EventInfo> {
    const response = await fetch(`${this.baseUrl}/event/${eventSlug}/register`, {
      method: 'GET',
    })

    const result = await response.json()

    if (response.ok) {
      return result.event
    } else {
      throw new Error(result.error || result.message || `Failed to get event info: ${response.status}`)
    }
  }

  async getGalleryPhotos(userId: string, token: string, filter: 'all' | 'enhanced' | 'favorites' = 'all') {
    const params = new URLSearchParams({ 
      filter 
    })
    
    const response = await fetch(`${this.baseUrl}/api/gallery/${userId}/${token}?${params}`, {
      method: 'GET',
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      throw new Error(result.error || result.message || `Failed to fetch gallery: ${response.status}`)
    }
  }

  async getGallery(code: string, filter: string = 'all'): Promise<GalleryResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/u/${code}?filter=${filter}`,
      {
        method: 'GET',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }
    return response.json();
  }

  // ⚠️ 后端接口未实现，仅为前端占位/预留
  async downloadPhotos(code: string, photoIds: string[], format: 'original' | 'compressed' = 'original') {
    const response = await fetch(`${this.baseUrl}/u/${code}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoIds, format }),
    })

    if (response.ok) {
      return await response.blob()
    } else {
      const result = await response.json()
      throw new Error(result.error || result.message || `Download failed: ${response.status}`)
    }
  }

  async sharePhotos(code: string, photoIds: string[], platform: 'link' | 'email' = 'link') {
    const response = await fetch(`${this.baseUrl}/u/${code}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoIds, platform }),
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      throw new Error(result.error || result.message || `Share failed: ${response.status}`)
    }
  }

  async resolveGalleryShortUrl(code: string): Promise<{
    user_id: string;
    access_token: string;
  }> {
    const response = await fetch(`${this.baseUrl}/u/${code}`);
    if (!response.ok) {
      throw new Error('Failed to resolve gallery URL');
    }
    return response.json();
  }

  // Delete photo from gallery (using gallery-specific deletion endpoint)
  async deleteGalleryPhoto(code: string, photoId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/u/${code}/photos/${photoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(result.error || result.message || `Failed to delete photo: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService 