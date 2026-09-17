import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyKYC, submitKYC, resubmitKYC } from '../lib/kycApi';
import { ShieldCheck, Upload, CheckCircle, AlertTriangle, Clock, X, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KYC() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    documentType: 'AADHAAR',
  });
  const [docFile, setDocFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data, isLoading } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ['myKYC'] });
      setDocFile(null);
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
      queryClient.invalidateQueries({ queryKey: ['myKYC'] });
      setDocFile(null);
      setPreview(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to resubmit KYC');
    }
  });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    setDocFile(file);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docFile && !data?.kyc) {
      toast.error('Please select a document to upload');
      return;
    }
    
    const dataToSend = new FormData();
    dataToSend.append('fullName', formData.fullName);
    dataToSend.append('dateOfBirth', formData.dateOfBirth);
    dataToSend.append('address', formData.address);
    dataToSend.append('documentType', formData.documentType);
    if (docFile) {
      dataToSend.append('document', docFile);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const kyc = data?.kyc;

  // Render Status UI - PENDING
  if (kyc && kyc.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 p-8 sm:p-10 text-center border border-white/50 transform transition-all hover:-translate-y-1 hover:shadow-3xl">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-full h-full bg-gradient-to-tr from-amber-100 to-amber-50 rounded-full flex items-center justify-center shadow-inner border border-amber-200/50">
              <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Review in Progress</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your verification documents have been securely submitted and are currently being reviewed. This usually takes <span className="font-semibold text-slate-700">24-48 hours</span>.
          </p>
          
          <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-5 text-left border border-slate-100/80 shadow-inner">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200/60">
              <span className="text-sm font-medium text-slate-500">Document Type</span>
              <span className="text-sm font-bold text-slate-800 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">{kyc.documentType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Submitted On</span>
              <span className="text-sm font-bold text-slate-800">{new Date(kyc.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Status UI - APPROVED
  if (kyc && kyc.status === 'APPROVED') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-900/5 p-8 sm:p-10 text-center border border-white/50 transform transition-all hover:-translate-y-1">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-lg shadow-emerald-500/30">
             <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
            <CheckCircle className="h-12 w-12 text-white relative z-10" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Identity Verified</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Congratulations! Your identity has been successfully verified. You now have full access to all LedgerPay features.
          </p>
          
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-800 px-5 py-4 rounded-2xl text-sm font-semibold border border-emerald-200/50 shadow-sm flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Approved on {new Date(kyc.reviewedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <button onClick={() => window.location.href = '/home/dashboard'} className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group">
            Go to Dashboard
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Render Form UI (New or REJECTED)
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      {/* Premium Background Header */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-cyan-50 z-0 rounded-b-[3rem] overflow-hidden border-b border-cyan-100">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-100/50 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl mb-6 shadow-sm border border-cyan-100">
            <ShieldCheck className="h-10 w-10 text-cyan-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-slate-800">Identity Verification</h1>
          <p className="max-w-xl mx-auto text-slate-500 text-lg sm:text-xl">
            Securely verify your identity to unlock full account capabilities and remove transaction limits.
          </p>
        </div>

        {kyc && kyc.status === 'REJECTED' && (
          <div className="bg-white/80 backdrop-blur-xl border border-red-200 p-6 sm:p-8 rounded-3xl mb-10 shadow-xl shadow-red-900/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-2xl shrink-0">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">KYC Application Rejected</h3>
                <div className="bg-red-50 text-red-800 p-4 rounded-xl font-medium border border-red-100 inline-block mb-3">
                  Reason: {kyc.rejectionReason}
                </div>
                <p className="text-slate-500">Please review the reason above, correct your information, and submit your documents again.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all">
          <div className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 gap-y-8 gap-x-8 sm:grid-cols-2">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2">Full Name (as per document)</label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    defaultValue={kyc?.fullName || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. John Doe"
                    className="block w-full rounded-2xl border-0 py-4 px-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-base transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    defaultValue={kyc?.dateOfBirth ? new Date(kyc.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-2xl border-0 py-4 px-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-base transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Document Type */}
                <div>
                  <label htmlFor="documentType" className="block text-sm font-bold text-slate-700 mb-2">Document Type</label>
                  <select
                    name="documentType"
                    id="documentType"
                    defaultValue={kyc?.documentType || 'AADHAAR'}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-2xl border-0 py-4 px-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-base transition-all bg-slate-50 focus:bg-white"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="VOTER_ID">Voter ID</option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-2">Full Address</label>
                  <textarea
                    name="address"
                    id="address"
                    rows={4}
                    defaultValue={kyc?.address || ''}
                    onChange={handleChange}
                    required
                    placeholder="Enter your complete residential address..."
                    className="block w-full rounded-2xl border-0 py-4 px-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-base transition-all resize-none bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* File Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Upload Identity Document</label>
                  <div 
                    className={`flex justify-center rounded-3xl border-2 border-dashed px-6 py-12 transition-all relative group cursor-pointer ${isDragging ? 'border-cyan-500 bg-cyan-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50/30'}`}
                    onClick={() => window.document.getElementById('file-upload')?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      {preview ? (
                        <div className="relative inline-block group/preview">
                           <img src={preview} alt="Preview" className="mx-auto max-h-56 rounded-2xl shadow-md border border-slate-200 object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                             <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Change Image</span>
                           </div>
                           <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setDocFile(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-10">
                              <X size={18} />
                           </button>
                        </div>
                      ) : docFile ? (
                        <div className="relative inline-block bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group/file">
                           <FileText className="mx-auto h-16 w-16 text-cyan-500 mb-4" />
                           <span className="text-sm font-bold text-slate-700 block max-w-[200px] truncate">{docFile.name}</span>
                           <span className="text-xs text-slate-400 mt-1 block">{(docFile.size / 1024 / 1024).toFixed(2)} MB</span>
                           <button type="button" onClick={(e) => { e.stopPropagation(); setDocFile(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-10">
                              <X size={18} />
                           </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="h-8 w-8 text-cyan-500" aria-hidden="true" />
                          </div>
                          <div className="mt-4 flex text-base leading-6 text-slate-600 justify-center items-center gap-1">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-bold text-cyan-600 hover:text-cyan-500 focus-within:outline-none"
                            >
                              <span>Click to upload</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                            </label>
                            <span>or drag and drop</span>
                          </div>
                          <p className="text-sm leading-5 text-slate-400 mt-2 font-medium">PDF, PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitMutation.isPending || resubmitMutation.isPending}
                  className="w-full flex justify-center py-5 px-6 rounded-2xl shadow-xl shadow-cyan-600/20 text-base font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {submitMutation.isPending || resubmitMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : kyc?.status === 'REJECTED' ? (
                    'Resubmit Application'
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
