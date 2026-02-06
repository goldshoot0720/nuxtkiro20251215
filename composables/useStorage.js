import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseCredentials } from './useSettings'

let supabase = null
let currentCredentials = null

const initSupabase = () => {
  if (typeof window === 'undefined') return null
  const creds = getSupabaseCredentials()
  const config = useRuntimeConfig()
  const url = creds?.url || config.public.supabaseUrl
  const key = creds?.key || config.public.supabaseAnonKey
  const credKey = `${url}:${key?.slice(0, 20)}`
  if (supabase && currentCredentials !== credKey) supabase = null
  if (!supabase) {
    supabase = createClient(url, key)
    currentCredentials = credKey
  }
  return supabase
}

export const useStorage = () => {
  const uploading = ref(false)
  const uploadProgress = ref(0)

  /**
   * Upload file to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} bucket - Storage bucket name
   * @param {string} path - Optional path in bucket (defaults to file name)
   * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
   */
  const uploadFile = async (file, bucket, path = null) => {
    const client = initSupabase()
    if (!client) return { success: false, error: 'No Supabase client' }

    try {
      uploading.value = true
      uploadProgress.value = 0

      // Generate unique file path
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = path || `${timestamp}_${file.name}`
      const filePath = `${fileName}`

      // Upload file
      const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(filePath)

      uploadProgress.value = 100

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      }
    } catch (e) {
      console.error('Upload error:', e)
      return { success: false, error: e.message }
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  /**
   * Delete file from Supabase Storage
   * @param {string} bucket - Storage bucket name
   * @param {string} path - File path in bucket
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const deleteFile = async (bucket, path) => {
    const client = initSupabase()
    if (!client) return { success: false, error: 'No Supabase client' }

    try {
      const { error } = await client.storage
        .from(bucket)
        .remove([path])

      if (error) throw error

      return { success: true }
    } catch (e) {
      console.error('Delete error:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * Get public URL for a file
   * @param {string} bucket - Storage bucket name
   * @param {string} path - File path in bucket
   * @returns {string|null}
   */
  const getPublicUrl = (bucket, path) => {
    const client = initSupabase()
    if (!client) return null

    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * List files in a bucket
   * @param {string} bucket - Storage bucket name
   * @param {string} path - Optional path to list (defaults to root)
   * @returns {Promise<{success: boolean, files?: Array, error?: string}>}
   */
  const listFiles = async (bucket, path = '') => {
    const client = initSupabase()
    if (!client) return { success: false, error: 'No Supabase client' }

    try {
      const { data, error } = await client.storage
        .from(bucket)
        .list(path)

      if (error) throw error

      return { success: true, files: data }
    } catch (e) {
      console.error('List files error:', e)
      return { success: false, error: e.message }
    }
  }

  return {
    uploading,
    uploadProgress,
    uploadFile,
    deleteFile,
    getPublicUrl,
    listFiles
  }
}
