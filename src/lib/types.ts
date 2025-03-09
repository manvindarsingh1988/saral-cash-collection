export type Role = 'Admin' | 'Collector' | 'RetailUser'

export interface UserProfile {
  id: string
  user_id: string
  role_id: string
  assigned_collector_id?: string
  created_at: string
  role?: {
    name: Role
  }
}

export interface Collector extends UserProfile {
  role: {
    name: 'Collector'
  }
}