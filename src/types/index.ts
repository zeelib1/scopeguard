// Database row types for all 17 tables
export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  client_name: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  budget?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ScopeItem {
  id: number;
  project_id: number;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Request {
  id: number;
  project_id: number;
  description: string;
  client_name: string;
  status: 'pending' | 'approved' | 'rejected';
  in_scope: boolean;
  cost_impact: number | null;
  time_impact: number | null;
  created_at: string;
  updated_at: string;
  priority?: 'low' | 'medium' | 'high' | null;
  client_approved?: number | null;
}

export interface ChangeOrder {
  id: number;
  project_id: number;
  request_id: number;
  title: string;
  description: string;
  cost: number;
  time_estimate: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at: string | null;
}

export interface CommunicationLog {
  id: number;
  project_id: number;
  message: string;
  sender: string;
  channel: 'email' | 'slack' | 'phone' | 'meeting' | 'other';
  created_at: string;
  related_request_id?: number | null;
}

export interface ActivityLog {
  id: number;
  project_id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  created_at: string;
}

export interface Budget {
  id: number;
  project_id: number;
  total_budget: number;
  allocated: number;
  spent: number;
  remaining: number;
  updated_at: string;
}

export interface TimeEntry {
  id: number;
  project_id: number;
  user_id: number;
  description: string;
  hours: number;
  date: string;
  billable: number;
  created_at: string;
}

export interface Attachment {
  id: number;
  project_id: number;
  entity_type: 'request' | 'change_order' | 'communication' | 'project';
  entity_id: number;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
  uploaded_at: string;
}

export interface Report {
  id: number;
  project_id: number;
  report_type: 'weekly' | 'monthly' | 'custom';
  generated_at: string;
  data: string;
}

export interface PortalToken {
  id: number;
  project_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  added_at: string;
}

export interface Webhook {
  id: number;
  project_id: number;
  url: string;
  events: string;
  active: number;
  created_at: string;
}

export interface ScopeTemplate {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  items: string;
  created_at: string;
}

export interface Template {
  id: number;
  user_id: number;
  name: string;
  type: 'project' | 'scope' | 'request' | 'change_order';
  content: string;
  created_at: string;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  client_name: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

export interface CreateRequestRequest {
  description: string;
  client_name: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateChangeOrderRequest {
  request_id: number;
  title: string;
  description: string;
  cost: number;
  time_estimate: number;
}

export interface UpdateRequestStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
  in_scope?: boolean;
  cost_impact?: number;
  time_impact?: number;
}

export interface CreateCommunicationRequest {
  message: string;
  sender: string;
  channel: 'email' | 'slack' | 'phone' | 'meeting' | 'other';
  related_request_id?: number;
}

export interface CreateTimeEntryRequest {
  description: string;
  hours: number;
  date: string;
  billable?: boolean;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
}

// Express request extensions
export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

// Database query result types
export type DatabaseRow = Record<string, any>;
