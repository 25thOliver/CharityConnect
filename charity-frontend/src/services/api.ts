import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log("Auth token going out:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  amount_raised: number;
  category?: string;
  location?: string;
  image?: string;
  created_at: string;
}


export interface User {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
}

export interface SignupData {
  name: string;
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// ✅ What we send to the backend
export interface DonationPayload {
  campaign: number;
  amount: number;
}

// ✅ What we receive from the backend
export interface DonationData {
  id: number;
  amount: number;
  donated_at: string;
  campaign: {
    id: number;
    title: string;
  };
}

// Add this interface if it doesn't exist yet
export interface CommentData {
  id: number;
  campaign: number;
  donor_name: string;
  text: string;
  created_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


// Fetch comments for a campaign
// Fetch comments for a campaign (handles pagination)
async function getComments(campaignId: number): Promise<CommentData[]> {
  const response = await api.get(`/comments/?campaign=${campaignId}`);
  return response.data.results || [];
}


// Post a new comment
async function postComment(data: { campaign: number; text: string }): Promise<CommentData> {
  const response = await api.post('/comments/', {
    campaign: data.campaign,
    text: data.text,  // ← Use 'text', not 'comment_text'
  });
  return response.data;
}



export const apiService = {
  // Campaigns
  getCampaigns: async (params?: Record<string, any>): Promise<PaginatedResponse<Campaign>> => {
  const response = await api.get('/campaigns/', { params });
  return response.data;
},


  getCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}/`);
    return response.data;
  },

  // Authentication
  signup: async (data: SignupData): Promise<{ message: string }> => {
    const response = await api.post('/signup/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<{ access: string; refresh: string }> => {
    const response = await api.post('/token/', data);
    return response.data;
  },

  // Donations
  makeDonation: async (data: DonationPayload): Promise<DonationData> => {
    const response = await api.post('/donations/', data);
    return response.data;
  },


  getMyDonations: async (): Promise<DonationData[]> => {
  const response = await api.get('/my-donations/');
  return response.data;
},

// Comments
getComments,
postComment,

};

export default api;
