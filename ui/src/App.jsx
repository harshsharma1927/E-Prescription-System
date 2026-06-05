import { useEffect, useMemo, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import PrescriptionBuilder from './components/PrescriptionBuilder';
import PatientHistoryPanel from './components/PatientHistoryPanel';
import CatalogManager from './components/CatalogManager';
import { apiRequest, apiUrl } from './lib/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('doctor_token') || '');
  const [doctor, setDoctor] = useState(() => {
    const raw = localStorage.getItem('doctor_profile');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('prescription');
  const [symptoms, setSymptoms] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const authed = Boolean(token);

  const withLoading = async (fn) => {
    setLoading(true);
    setError('');
    try {
      return await fn();
    } catch (err) {
      setError(err?.payload?.message || err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const authRequest = ({ path, method, body }) => apiRequest({ path, method, body, token });

  const refreshCatalog = async () => {
    const [symptomRes, medicineRes] = await Promise.all([
      authRequest({ path: '/symptoms' }),
      authRequest({ path: '/medicines' }),
    ]);
    setSymptoms(symptomRes.results || []);
    setMedicines(medicineRes.results || []);
  };

  useEffect(() => {
    if (!authed) return;
    withLoading(async () => {
      await refreshCatalog();
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const login = async ({ email, password }) =>
    withLoading(async () => {
      const data = await apiRequest({
        path: '/auth/login',
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem('doctor_token', data.token);
      localStorage.setItem('doctor_profile', JSON.stringify(data.doctor || {}));
      setToken(data.token);
      setDoctor(data.doctor);
      setNotice('Login successful.');
      return data;
    });

  const register = async (payload) =>
    withLoading(async () => {
      await apiRequest({ path: '/auth/register', method: 'POST', body: payload });
      setNotice('Signup successful. Please login.');
    });

  const logout = () => {
    localStorage.removeItem('doctor_token');
    localStorage.removeItem('doctor_profile');
    setToken('');
    setDoctor(null);
    setNotice('Logged out.');
  };

  const api = useMemo(
    () => ({
      fetchMedicinesBySymptoms: (symptomIds) =>
        withLoading(async () => {
          const data = await authRequest({
            path: '/medicines/by-symptoms',
            method: 'POST',
            body: { symptomIds },
          });
          setFilteredMedicines(data.results || []);
          return data;
        }),
      createPrescription: (payload) =>
        withLoading(async () => {
          const data = await authRequest({ path: '/prescriptions', method: 'POST', body: payload });
          setNotice(`Prescription sent. Reference ID: ${data.patient_reference_id}`);
          return data;
        }),
      searchPatients: (params) =>
        withLoading(async () => {
          const q = new URLSearchParams(
            Object.entries(params).filter(([, v]) => String(v || '').trim())
          ).toString();
          return authRequest({ path: `/patients/search?${q}` });
        }),
      getHistory: (referenceId) => withLoading(async () => authRequest({ path: `/patients/${referenceId}/history` })),
      downloadPdf: async (prescriptionId) => {
        await withLoading(async () => {
          const response = await fetch(apiUrl(`/prescriptions/${prescriptionId}/pdf`), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Unable to fetch PDF');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `prescription_${prescriptionId}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        });
      },
      createSymptom: (payload) =>
        withLoading(async () => {
          await authRequest({ path: '/symptoms', method: 'POST', body: payload });
          await refreshCatalog();
        }),
      deleteSymptom: (id) =>
        withLoading(async () => {
          await authRequest({ path: `/symptoms/${id}`, method: 'DELETE' });
          await refreshCatalog();
        }),
      createMedicine: (payload) =>
        withLoading(async () => {
          await authRequest({ path: '/medicines', method: 'POST', body: payload });
          await refreshCatalog();
        }),
      deleteMedicine: (id) =>
        withLoading(async () => {
          await authRequest({ path: `/medicines/${id}`, method: 'DELETE' });
          await refreshCatalog();
        }),
      createMapping: (payload) =>
        withLoading(async () => {
          await authRequest({ path: '/symptom-medicines', method: 'POST', body: payload });
          setNotice('Mapping created successfully.');
        }),
    }),
    [token]
  );

  if (!authed) {
    return (
      <main className="min-h-screen bg-slate-100 px-4">
        <AuthPanel
          onLogin={login}
          onRegister={register}
          loading={loading}
          error={error || notice}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Prescription Manager</h1>
            <p className="text-sm text-slate-600">Logged in as {doctor?.name || doctor?.email}</p>
          </div>
          <div className="flex gap-2">
            {['prescription', 'patients', 'catalog'].map((t) => (
              <button
                key={t}
                className={`rounded-md px-3 py-2 text-sm ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
                onClick={() => setTab(t)}
                type="button"
              >
                {t}
              </button>
            ))}
            <button className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </header>

        {notice ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p> : null}
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {tab === 'prescription' ? (
          <PrescriptionBuilder
            doctor={doctor}
            symptoms={symptoms}
            medicines={filteredMedicines.length ? filteredMedicines : medicines}
            onFetchMedicines={api.fetchMedicinesBySymptoms}
            onCreatePrescription={api.createPrescription}
            loading={loading}
          />
        ) : null}

        {tab === 'patients' ? (
          <PatientHistoryPanel
            onSearch={api.searchPatients}
            onHistory={api.getHistory}
            onDownloadPdf={api.downloadPdf}
            loading={loading}
          />
        ) : null}

        {tab === 'catalog' ? (
          <CatalogManager
            symptoms={symptoms}
            medicines={medicines}
            onCreateSymptom={api.createSymptom}
            onDeleteSymptom={api.deleteSymptom}
            onCreateMedicine={api.createMedicine}
            onDeleteMedicine={api.deleteMedicine}
            onCreateMapping={api.createMapping}
            loading={loading}
          />
        ) : null}
      </div>
    </main>
  );
}

export default App;
