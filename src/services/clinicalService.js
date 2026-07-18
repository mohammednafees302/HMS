import { api } from '../utils/api';

const base = (patientId) => `/patients/${patientId}/clinical`;

export const clinicalService = {

  // ── Patient Summary ──────────────────────────────────────
  getSummary: async (patientId) => {
    const res = await api.get(`${base(patientId)}/summary`);
    return res.data;
  },

  // ── Medical Records (EHR) ─────────────────────────────────
  getRecords: async (patientId) => {
    const res = await api.get(`${base(patientId)}/records`);
    return res.data;
  },
  createRecord: async (patientId, data) => {
    const res = await api.post(`${base(patientId)}/records`, data);
    return res.data;
  },
  updateRecord: async (patientId, recordId, data) => {
    const res = await api.put(`${base(patientId)}/records/${recordId}`, data);
    return res.data;
  },
  deleteRecord: async (patientId, recordId) => {
    const res = await api.delete(`${base(patientId)}/records/${recordId}`);
    return res.data;
  },

  // ── Prescriptions ─────────────────────────────────────────
  getPrescriptions: async (patientId) => {
    const res = await api.get(`${base(patientId)}/prescriptions`);
    return res.data;
  },
  createPrescription: async (patientId, data) => {
    const res = await api.post(`${base(patientId)}/prescriptions`, data);
    return res.data;
  },
  updatePrescription: async (patientId, prescriptionId, data) => {
    const res = await api.put(`${base(patientId)}/prescriptions/${prescriptionId}`, data);
    return res.data;
  },
  deletePrescription: async (patientId, prescriptionId) => {
    const res = await api.delete(`${base(patientId)}/prescriptions/${prescriptionId}`);
    return res.data;
  },

  // ── Lab Tests ─────────────────────────────────────────────
  getLabTests: async (patientId) => {
    const res = await api.get(`${base(patientId)}/lab-tests`);
    return res.data;
  },
  createLabTest: async (patientId, data) => {
    const res = await api.post(`${base(patientId)}/lab-tests`, data);
    return res.data;
  },
  updateLabTest: async (patientId, testId, data) => {
    const res = await api.put(`${base(patientId)}/lab-tests/${testId}`, data);
    return res.data;
  },
  deleteLabTest: async (patientId, testId) => {
    const res = await api.delete(`${base(patientId)}/lab-tests/${testId}`);
    return res.data;
  },
  uploadLabResult: async (patientId, testId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post(`${base(patientId)}/lab-tests/${testId}/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ── Documents ─────────────────────────────────────────────
  getDocuments: async (patientId) => {
    const res = await api.get(`${base(patientId)}/documents`);
    return res.data;
  },
  uploadDocument: async (patientId, file, meta) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', meta.title);
    fd.append('category', meta.category || 'OTHER');
    if (meta.notes) fd.append('notes', meta.notes);
    const res = await api.post(`${base(patientId)}/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteDocument: async (patientId, documentId) => {
    const res = await api.delete(`${base(patientId)}/documents/${documentId}`);
    return res.data;
  },
};
