export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  created_at: string
  ideas_count: number
  sales_count: number
}

export interface Idea {
  id: string
  title: string
  description: string
  category: string
  price: number
  currency: string
  images: string[]
  video_url?: string
  tags: string[]
  status: 'active' | 'sold' | 'draft'
  author_id: string
  author: User
  view_count: number
  daily_views: number
  weekly_views: number
  monthly_views: number
  copyright_hash: string
  copyright_registered_at: string
  created_at: string
  updated_at: string
  purchase_requests_count: number
  is_featured: boolean
}

export interface PurchaseRequest {
  id: string
  idea_id: string
  buyer_id: string
  seller_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  offered_price?: number
  created_at: string
  idea: Idea
  buyer: User
  seller: User
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  purchase_request_id: string
  content: string
  created_at: string
  is_read: boolean
  sender: User
}

export interface RankingItem {
  idea: Idea
  rank: number
  views: number
  period: 'daily' | 'weekly' | 'monthly'
}

export type Category =
  | '기술/IT'
  | '패션/뷰티'
  | '식품/음료'
  | '건강/의료'
  | '교육'
  | '엔터테인먼트'
  | '환경/지속가능성'
  | '스마트홈'
  | '반려동물'
  | '여행/레저'
  | '금융/핀테크'
  | '소셜/커뮤니티'
  | '기타'
