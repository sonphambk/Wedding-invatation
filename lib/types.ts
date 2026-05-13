// lib/types.ts
import { WeddingTheme } from './theme'

export type { WeddingTheme }

export interface PhotoEntry {
  url: string;
  sort_order: number;
}

export interface WeddingConfig {
  id: number;
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  venue_name: string;
  venue_address: string;
  maps_url: string;
  dresscode: string;
  extra_notes: string;
  bank1_code: string;
  bank1_account: string;
  bank1_holder: string;
  bank2_code: string;
  bank2_account: string;
  bank2_holder: string;
  music_url: string;
  photos: PhotoEntry[];
  /**
   * Raw JSONB from DB — shape is unverified at runtime.
   * Always pass through resolveTheme() before use.
   */
  theme_json: WeddingTheme | null;
  updated_at: string;
}

export interface Wish {
  id: string;
  guest_name: string;
  message: string;
  likes: number;
  approved: boolean;
  created_at: string;
}

export type PublicConfig = Omit<WeddingConfig, 'updated_at'>;
export type PublicWish = Pick<Wish, 'id' | 'guest_name' | 'message' | 'likes' | 'created_at'>;
