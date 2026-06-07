import { supabase } from './supabase'

export async function uploadPhoto(file: File, bucket = 'item-photos'): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(fileName, file)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}
