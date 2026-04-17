import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeFarm = async (data) => {
  try {
    const response = await api.post('/api/farm/analyze', data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getResults = async (farmId) => {
  try {
    const response = await api.get(`/api/results/${farmId}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const downloadCertificate = (farmId) => {
  window.open(`http://localhost:5000/api/certificate/${farmId}`, '_blank');
};
