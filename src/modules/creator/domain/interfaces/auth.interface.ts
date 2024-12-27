export interface CreatorResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_pic_url?: string;
}

export interface AuthResponse {
  access_token: string;
  creator: CreatorResponse;
} 