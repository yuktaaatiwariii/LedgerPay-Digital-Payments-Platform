import { axiosInstance } from './axios';

// USER KYC API
export const submitKYC = async (formData) => {
    const response = await axiosInstance.post('/kyc', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getMyKYC = async () => {
    const response = await axiosInstance.get('/kyc/me');
    return response.data;
};

export const resubmitKYC = async (formData) => {
    const response = await axiosInstance.put('/kyc/resubmit', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ADMIN KYC API
export const getKYCApplications = async (status, page = 1, limit = 20) => {
    const params = { page, limit };
    if (status && status !== 'ALL') {
        params.status = status;
    }
    const response = await axiosInstance.get('/admin/kyc', { params });
    return response.data;
};

export const getKYCApplicationById = async (id) => {
    const response = await axiosInstance.get(`/admin/kyc/${id}`);
    return response.data;
};

export const approveKYC = async (id) => {
    const response = await axiosInstance.patch(`/admin/kyc/${id}/approve`);
    return response.data;
};

export const rejectKYC = async (id, rejectionReason) => {
    const response = await axiosInstance.patch(`/admin/kyc/${id}/reject`, { rejectionReason });
    return response.data;
};
