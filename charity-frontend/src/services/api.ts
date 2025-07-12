import axios from 'axios';

// Force HTTP for development
const API_BASE_URL = 'http://127.0.0.1:8000/api';

console.log('API Base URL:', API_BASE_URL);

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
  console.log("Request URL:", config.url);
  console.log("Full request URL:", config.baseURL + config.url);
  console.log("Request method:", config.method);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Authorization header set:", config.headers.Authorization);
  } else {
    console.log("No token found in localStorage");
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", error.message);
    console.error("Error config:", error.config);
    return Promise.reject(error);
  }
);

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
  email: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetConfirmData {
  uid: string;
  token: string;
  new_password: string;
}

// ✅ What we send to the backend
export interface DonationPayload {
  campaign: number;
  amount: number;
}

// Admin interfaces
export interface AdminUser {
  id: number;
  role: string;
  role_display: string;
  username: string;
  email: string;
  first_name: string;
}

export interface AdminLoginData {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access: string;
  refresh: string;
  admin: AdminUser;
}

export interface DashboardStats {
  total_campaigns: number;
  active_campaigns: number;
  total_donations: number;
  total_amount_raised: number;
  total_donors: number;
}

export interface AdminDashboard {
  admin: AdminUser;
  statistics: DashboardStats;
}

export interface CampaignCreateData {
  title: string;
  description: string;
  goal: number;
  category: string;
  location: string;
  image?: File;
  featured?: boolean;
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

  // Password Reset
  requestPasswordReset: async (data: PasswordResetRequestData): Promise<{ message: string }> => {
    const response = await api.post('/password-reset/', data);
    return response.data;
  },

  confirmPasswordReset: async (data: PasswordResetConfirmData): Promise<{ message: string }> => {
    const response = await api.post('/password-reset/confirm/', data);
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

  // User Profile
  getMyProfile: async (): Promise<User> => {
    const response = await api.get('/my-profile/');
    return response.data;
  },

// Comments
getComments,
postComment,

};

// Admin API functions
export const adminApi = {
  login: async (data: AdminLoginData): Promise<AdminLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Admin login failed');
    }

    return response.json();
  },

  getDashboard: async (): Promise<AdminDashboard> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  },

  createCampaign: async (data: CampaignCreateData): Promise<Campaign> => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/campaigns/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create campaign');
    }

    return response.json();
  },

  updateCampaign: async (id: number, data: Partial<CampaignCreateData>): Promise<Campaign> => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update campaign');
    }

    return response.json();
  },

  deleteCampaign: async (id: number): Promise<void> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete campaign');
    }
  },

  getAdminCampaigns: async (): Promise<Campaign[]> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }

    return response.json();
  },

  getAdminDonations: async (): Promise<DonationData[]> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/donations/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch donations');
    }

    return response.json();
  },

  getAdminComments: async (): Promise<CommentData[]> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/comments/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  },

  deleteComment: async (id: number): Promise<void> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/comments/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },
};

export default api;
