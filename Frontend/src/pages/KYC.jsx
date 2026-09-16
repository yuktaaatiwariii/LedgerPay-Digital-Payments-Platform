import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyKYC, submitKYC, resubmitKYC } from '../lib/kycApi';
import { ShieldCheck, Upload, CheckCircle, AlertTriangle, Clock, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KYC() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    documentType: 'AADHAAR',
  });
  const [document, setDocument] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['myKYC'],
    queryFn: async () => {
      try {
        return await getMyKYC();
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitKYC,
    onSuccess: () => {
      toast.success('KYC Submitted successfully!');
      queryClient.invalidateQueries(['myKYC']);
      setDocument(null);
      setPreview(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit KYC');
    }
  });

  const resubmitMutation = useMutation({
    mutationFn: resubmitKYC,
    onSuccess: () => {
      toast.success('KYC Resubmitted successfully!');
      queryClient.invalidateQueries(['myKYC']);
      setDocument(null);
      setPreview(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to resubmit KYC');
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocument(file);
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!document && !data?.kyc) {
      toast.error('Please select a document to upload');
      return;
    }
    
    const dataToSend = new FormData();
    dataToSend.append('fullName', formData.fullName);
    dataToSend.append('dateOfBirth', formData.dateOfBirth);
    dataToSend.append('address', formData.address);
    dataToSend.append('documentType', formData.documentType);
    if (document) {
      dataToSend.append('document', document);
    }

    if (data?.kyc?.status === 'REJECTED') {
      resubmitMutation.mutate(dataToSend);
    } else {
      submitMutation.mutate(dataToSend);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kyc = data?.kyc;

  // Render Status UI
  if (kyc && kyc.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100 transform transition-all hover:scale-[1.02]">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">KYC Under Review</h2>
          <p className="text-slate-500 mb-6">
            Your documents have been submitted and are currently under review by our team. This usually takes 24-48 hours.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-500">Document Type</span>
              <span className="text-sm font-bold text-slate-800">{kyc.documentType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Submitted On</span>
              <span className="text-sm font-bold text-slate-800">{new Date(kyc.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kyc && kyc.status === 'APPROVED') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100 transform transition-all hover:scale-[1.02]">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-emerald-200 animate-ping opacity-20"></div>
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">KYC Verified</h2>
          <p className="text-slate-500 mb-6">
            Your identity has been successfully verified. You now have full access to all LedgerPay features.
          </p>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-100">
            Approved on {new Date(kyc.reviewedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600 rounded-b-[4rem] -z-10 shadow-lg" />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 text-white">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 drop-shadow-md" />
          <h1 className="text-3xl font-extrabold tracking-tight">Identity Verification</h1>
          <p className="mt-3 max-w-xl mx-auto text-blue-100 text-lg">
            Securely verify your identity to unlock full account capabilities.
          </p>
        </div>

        {kyc && kyc.status === 'REJECTED' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl mb-8 shadow-sm">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5 mr-4 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-1">KYC Rejected</h3>
                <p className="text-red-700 font-medium">Reason: {kyc.rejectionReason}</p>
                <p className="text-red-600 text-sm mt-2">Please correct the information and submit your documents again.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">Full Name (as per document)</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      defaultValue={kyc?.fullName || ''}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700">Date of Birth</label>
                  <div className="mt-2">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      defaultValue={kyc?.dateOfBirth ? new Date(kyc.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="documentType" className="block text-sm font-semibold text-slate-700">Document Type</label>
                  <div className="mt-2">
                    <select
                      name="documentType"
                      id="documentType"
                      defaultValue={kyc?.documentType || 'AADHAAR'}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white transition-all"
                    >
                      <option value="AADHAAR">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="VOTER_ID">Voter ID</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-slate-700">Full Address</label>
                  <div className="mt-2">
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      defaultValue={kyc?.address || ''}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Document</label>
                  <div className="mt-2 flex justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors bg-white relative group cursor-pointer" onClick={() => document?.getElementById?.('file-upload')?.click()}>
                    <div className="text-center">
                      {preview ? (
                        <div className="relative inline-block">
                           <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg shadow-sm" />
                           <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setDocument(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                              <X size={16} />
                           </button>
                        </div>
                      ) : document ? (
                        <div className="relative inline-block bg-blue-50 p-6 rounded-2xl border border-blue-100">
                           <FileText className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                           <span className="text-sm font-bold text-blue-700">{document.name}</span>
                           <button type="button" onClick={(e) => { e.stopPropagation(); setDocument(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                              <X size={16} />
                           </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-slate-300 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                          <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                            >
                              <span>Upload a file</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-slate-500">PDF, PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitMutation.isPending || resubmitMutation.isPending}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {submitMutation.isPending || resubmitMutation.isPending ? 'Submitting...' : kyc?.status === 'REJECTED' ? 'Resubmit KYC Application' : 'Submit KYC Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
