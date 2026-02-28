import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const userAPI = {

  getCurrentUser: async (token) => {
    setAuthToken(token);
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },
  

  updateProfile: async (token, data) => {
    setAuthToken(token);
    const response = await api.patch('/api/v1/users/profile', data);
    return response.data;
  },
  

  switchRole: async (token, role) => {
    setAuthToken(token);
    const response = await api.put('/api/v1/users/role', { role });
    return response.data;
  },
  


getLeaderboard: async (period = 'all') => {
  const response = await api.get(`/api/v1/users/leaderboard?period=${period}&limit=50`);
  return response.data;
},
  

  getUserById: async (id) => {
    const response = await api.get(`/api/v1/users/${id}`);
    return response.data;
  }
};

export const problemAPI={

  getAllProblems: async (filters = {}) => {

    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/v1/problems?${params}`);
    return response.data;
  },
  createProblem:async(token,data)=>{
   setAuthToken(token)
   const response=await api.post('/api/v1/problems/',data)
    return response.data
  },

    getProblemById: async (id) => {
    const response = await api.get(`/api/v1/problems/${id}`);
    return response.data;
  },

updateProblem: async (token, id, data) => {
  setAuthToken(token);
  const response = await api.patch(`/api/v1/problems/${id}`, data); 
  return response.data;
},

getMyProblems: async (token, filters = {}) => {
  setAuthToken(token);
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/api/v1/problems/user/my-problems?${params}`); 
  return response.data;
},

voteProblem: async (token, id) => {
  setAuthToken(token);
  const response = await api.patch(`/api/v1/problems/${id}/vote`);
  return response.data;
},


}


export const submissionAPI={
create: async (token, data) => {
    setAuthToken(token);
    const response = await api.post('/api/v1/submissions', data);
    return response.data;
  },

  getByProblem: async (problemId) => {
    const response = await api.get(`/api/v1/submissions/problem/${problemId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/v1/submissions/${id}`);
    return response.data;
  },

  getMySubmissions: async (token, filters = {}) => {
    setAuthToken(token);
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/v1/submissions/my-submissions?${params}`);
    return response.data;
  },

  update: async (token, id, data) => {
    setAuthToken(token);
    const response = await api.patch(`/api/v1/submissions/${id}`, data);
    return response.data;
  },

  delete: async (token, id) => {
    setAuthToken(token);
    const response = await api.delete(`/api/v1/submissions/${id}`);
    return response.data;
  },

  vote: async (token, id) => {
    setAuthToken(token);
    const response = await api.patch(`/api/v1/submissions/${id}/vote`);
    return response.data;
  },

  selectWinner: async (token, id) => {
  setAuthToken(token);
  const response = await api.patch(`/api/v1/submissions/${id}/winner`);
  return response.data;
},
}

export default api;