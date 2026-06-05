import { useState } from 'react';
import Card from './Card';

function PatientHistoryPanel({ onSearch, onHistory, onDownloadPdf, loading }) {
  const [search, setSearch] = useState({ phone: '', name: '', reference_id: '' });
  const [historyRef, setHistoryRef] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  const runSearch = async () => {
    const data = await onSearch(search);
    setResults(data.results || []);
  };

  const runHistory = async (refFromRow) => {
    const ref = refFromRow || historyRef;
    if (!ref) return;
    const data = await onHistory(ref);
    setHistory(data.history || []);
    setMessage(`Showing history for ${data?.patient?.name || ''} (${data?.patient?.reference_id || ref})`);
  };

  return (
    <Card title="Patient Search & History">
      <div className="grid gap-2 md:grid-cols-4">
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Phone"
          value={search.phone}
          onChange={(e) => setSearch((s) => ({ ...s, phone: e.target.value }))}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Name"
          value={search.name}
          onChange={(e) => setSearch((s) => ({ ...s, name: e.target.value }))}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Reference ID"
          value={search.reference_id}
          onChange={(e) => setSearch((s) => ({ ...s, reference_id: e.target.value }))}
        />
        <button className="rounded-md border border-slate-300 px-4 py-2" type="button" onClick={runSearch} disabled={loading}>
          Search
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {results.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm">
            <span>
              {p.name} - {p.reference_id}
            </span>
            <button className="text-teal-700" type="button" onClick={() => runHistory(p.reference_id)}>
              View History
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-300 px-3 py-2"
          placeholder="Reference ID for history"
          value={historyRef}
          onChange={(e) => setHistoryRef(e.target.value)}
        />
        <button className="rounded-md border border-slate-300 px-4 py-2" type="button" onClick={() => runHistory()}>
          Get History
        </button>
      </div>

      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}

      <div className="mt-3 space-y-2">
        {history.map((h) => (
          <div key={h.prescription_id} className="rounded-md border border-slate-200 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{new Date(h.created_at).toLocaleString()}</p>
              <button className="text-teal-700" type="button" onClick={() => onDownloadPdf(h.prescription_id)}>
                Download PDF
              </button>
            </div>
            <p className="mt-1 text-slate-700">Symptoms: {(h.symptoms || []).map((s) => s.name).join(', ')}</p>
            <p className="text-slate-700">Medicines: {(h.medicines || []).map((m) => m.name).join(', ')}</p>
            <p className="text-slate-700">Notes: {h.notes || '-'}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default PatientHistoryPanel;

