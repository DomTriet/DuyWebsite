export interface PropertyMedia {
  id: string;
  property_id: string;
  media_url: string;
  media_type: string;
  is_thumbnail: boolean;
}

export interface Property {
  id: string;
  project_id?: string;
  category_id?: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  attributes: any; // JSONB
  created_by?: string;
  agent_id?: string;
  status: string;
  is_deleted: boolean;
  address?: string;
  map_embed_url?: string;
  property_media?: PropertyMedia[];
  categories?: { name: string };
  projects?: { name: string, theme_id: string };
}