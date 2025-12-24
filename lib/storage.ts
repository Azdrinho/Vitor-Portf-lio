import { supabase } from './supabaseClient';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The file object from the input.
 * @param bucket The name of the storage bucket (default: 'portfolio').
 */
export const uploadImage = async (file: File, bucket: string = 'portfolio'): Promise<string | null> => {
  try {
    // Generate a clean file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = fileName;

    // 1. Attempt Upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    
    // Extract specific error message
    const errorMsg = error.message || error.error_description || JSON.stringify(error);
    
    // Show detailed alert to user
    alert(
        `Falha no Upload:\n${errorMsg}\n\n` +
        `Possíveis causas:\n` +
        `1. Falta de Policy (RLS) para INSERT no bucket '${bucket}'. (Bucket Publico só libera leitura)\n` +
        `2. Arquivo muito grande (limite padrão é 50MB).\n` +
        `3. Nome de arquivo inválido.`
    );
    
    return null;
  }
};