export interface Property {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  attributes: any;
  category_id?: number;
  project_id?: string;
  created_by?: string;
  agent_id?: string;
  status: string;
  is_deleted: boolean;
  address?: string;
  map_embed_url?: string;
  property_media?: any[];
  categories?: { name: string };
  projects?: { name: string; theme_id: string };
}