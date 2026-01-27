// Define block size types available in the editor
export type BlockSize = 'square' | 'wide' | 'tall' | 'big';
export type BlockType = 'image' | 'video';

export interface BlockData {
  id: string;
  url: string;
  size: BlockSize;
  type?: BlockType;
}

// Define the Project Interface
export interface Project {
  id: number;
  title: string;
  category: string;
  image: string; // Cover image (thumbnail)
  className: string;
  description?: string;
  // New fields for detailed editing
  images?: string[]; // Legacy support for simple lists
  blocks?: BlockData[]; // New structured data for custom layouts
  layoutMode?: 'collage' | 'pdf'; // Determines how images are rendered
  gap?: number; // Spacing between images
  likes?: number; // Like counter
}