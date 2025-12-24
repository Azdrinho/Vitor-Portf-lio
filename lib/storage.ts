import { supabase } from './supabaseClient';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The file object from the input.
 * @param bucket The name of the storage bucket (default: 'portfolio').
 */
export const uploadImage = async (file: File, bucket: string = 'portfolio'): Promise<string | null> => {
  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the Public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    alert(`Erro ao fazer upload. Verifique se o bucket "${bucket}" existe e é público no Supabase.`);
    return null;
  }
};