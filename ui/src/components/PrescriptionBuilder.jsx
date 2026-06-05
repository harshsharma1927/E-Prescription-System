import { useMemo, useState } from 'react';
import Card from './Card';

function PrescriptionBuilder({ doctor, symptoms, onFetchMedicines, medicines, onCreatePrescription, loading }) {
  const [patient, setPatient] = useState({
    name: '',
    age: '',
    gender: '',
  });
  const [delivery, setDelivery] = useState({ email: '', phone: '' });
  const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const symptomNameById = useMemo(() => new Map(symptoms.map((s) => [s.id, s.name])), [symptoms]);

  const toggleSymptom = (id) => {
    setSelectedSymptomIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addMedicine = (medicine) => {
    setSelectedMedicines((prev) => {
      if (prev.some((m) => m.medicine_id === medicine.id)) return prev;
      return [
        ...prev,
        {
          medicine_id: medicine.id,
          name: medicine.name,
          dosage: '',
          frequency: '',
          duration: '',
          potency: '',
          instructions: '',
        },
      ];
    });
  };

  const updateMedicine = (id, key, value) => {
    setSelectedMedicines((prev) => prev.map((m) => (m.medicine_id === id ? { ...m, [key]: value } : m)));
  };

  const removeMedicine = (id) => setSelectedMedicines((prev) => prev.filter((m) => m.medicine_id !== id));

  const fetchBySymptoms = async () => {
    if (!selectedSymptomIds.length) return;
    await onFetchMedicines(selectedSymptomIds);
  };

  const submit = async () => {
    if (!delivery.email.trim() && !delivery.phone.trim()) {
      setMessage('Please provide at least patient email or phone before sending.');
      return;
    }

    const payload = {
      patient: {
        name: patient.name || undefined,
        email: delivery.email || undefined,
        phone: delivery.phone || undefined,
        age: patient.age ? Number(patient.age) : null,
        gender: patient.gender || null,
      },
      symptom_ids: selectedSymptomIds,
      medicines: selectedMedicines.map(({ medicine_id, dosage, frequency, duration, potency, instructions }) => ({
        medicine_id,
        dosage,
        frequency,
        duration,
        potency,
        instructions,
      })),
      notes,
    };

    const result = await onCreatePrescription(payload);
    setMessage(
      `Prescription created. Reference ID: ${result.patient_reference_id} | Prescription ID: ${result.prescription_id}`
    );
    setShowPreview(false);
  };

  const canPreview = selectedSymptomIds.length > 0 && selectedMedicines.length > 0 && patient.name.trim();

  return (
    <Card title="Create Prescription">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Patient name"
          value={patient.name}
          onChange={(e) => setPatient((s) => ({ ...s, name: e.target.value }))}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Age"
          value={patient.age}
          onChange={(e) => setPatient((s) => ({ ...s, age: e.target.value }))}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Gender"
          value={patient.gender}
          onChange={(e) => setPatient((s) => ({ ...s, gender: e.target.value }))}
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Symptoms</p>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <button
              key={s.id}
              className={`rounded-full border px-3 py-1 text-sm ${
                selectedSymptomIds.includes(s.id) ? 'border-teal-700 bg-teal-600 text-white' : 'border-slate-300'
              }`}
              onClick={() => toggleSymptom(s.id)}
              type="button"
            >
              {s.name}
            </button>
          ))}
        </div>
        {selectedSymptomIds.length ? (
          <p className="mt-2 text-xs text-slate-600">
            Active: {selectedSymptomIds.map((id) => symptomNameById.get(id)).join(', ')}
          </p>
        ) : null}
        <button
          type="button"
          className="mt-3 rounded-md border border-slate-300 px-3 py-1"
          onClick={fetchBySymptoms}
          disabled={loading || !selectedSymptomIds.length}
        >
          Fetch Medicines by Symptoms
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Available Medicines</p>
        <div className="flex flex-wrap gap-2">
          {medicines.map((m) => (
            <button
              key={m.id}
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1 text-sm"
              onClick={() => addMedicine(m)}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {selectedMedicines.map((m) => (
          <div key={m.medicine_id} className="rounded-md border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">{m.name}</p>
              <button className="text-sm text-red-600" type="button" onClick={() => removeMedicine(m.medicine_id)}>
                Remove
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                className="rounded-md border border-slate-300 px-2 py-1"
                placeholder="Dosage"
                value={m.dosage}
                onChange={(e) => updateMedicine(m.medicine_id, 'dosage', e.target.value)}
              />
              <input
                className="rounded-md border border-slate-300 px-2 py-1"
                placeholder="Frequency"
                value={m.frequency}
                onChange={(e) => updateMedicine(m.medicine_id, 'frequency', e.target.value)}
              />
              <input
                className="rounded-md border border-slate-300 px-2 py-1"
                placeholder="Duration"
                value={m.duration}
                onChange={(e) => updateMedicine(m.medicine_id, 'duration', e.target.value)}
              />
              <input
                className="rounded-md border border-slate-300 px-2 py-1"
                placeholder="Potency"
                value={m.potency}
                onChange={(e) => updateMedicine(m.medicine_id, 'potency', e.target.value)}
              />
              <input
                className="rounded-md border border-slate-300 px-2 py-1 md:col-span-2"
                placeholder="Instructions"
                value={m.instructions}
                onChange={(e) => updateMedicine(m.medicine_id, 'instructions', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <textarea
        className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2"
        rows={3}
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="mt-3 flex gap-2">
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => setShowPreview(true)}
          disabled={loading || !canPreview}
          type="button"
        >
          Preview & Send
        </button>
      </div>
      {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}

      {showPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Final Preview & Send</h3>
              <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={() => setShowPreview(false)}>
                Close
              </button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Patient email (recommended for sending PDF)
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={delivery.email}
                  onChange={(e) => setDelivery((s) => ({ ...s, email: e.target.value }))}
                  placeholder="patient@example.com"
                />
              </label>
              <label className="text-sm">
                Patient phone
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={delivery.phone}
                  onChange={(e) => setDelivery((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+91..."
                />
              </label>
            </div>

            <div className="rounded-lg border border-slate-300 bg-white p-6 text-slate-900">
              <div className="border-b border-slate-300 pb-3">
                <p className="text-3xl font-semibold">{doctor?.name || 'Doctor Name'}</p>
                <p className="text-sm text-slate-700">{doctor?.clinicName || 'Clinic Name'}</p>
                <p className="text-sm text-slate-600">{doctor?.clinicAddress || '-'}</p>
                <p className="text-sm text-slate-600">
                  {doctor?.clinicPhone || '-'} | {doctor?.email || '-'}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-b border-slate-200 pb-3 text-sm md:grid-cols-4">
                <p>
                  <span className="font-semibold">Patient:</span> {patient.name || '-'}
                </p>
                <p>
                  <span className="font-semibold">Age/Sex:</span> {patient.age || '-'} / {patient.gender || '-'}
                </p>
                <p>
                  <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
                </p>
                <p className="font-semibold text-teal-700">Reference ID: Will generate on send</p>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-3xl font-bold text-teal-700">R<span className="align-top text-base">x</span></p>
                <ol className="space-y-2">
                  {selectedMedicines.map((m, idx) => (
                    <li key={m.medicine_id} className="border-b border-slate-100 pb-2 text-sm">
                      <p className="font-semibold">
                        {idx + 1}. {m.name}
                      </p>
                      <p className="text-slate-700">
                        {m.dosage || '-'} | {m.frequency || '-'} | {m.duration || '-'}
                        {m.potency ? ` | ${m.potency}` : ''}
                      </p>
                      {m.instructions ? <p className="text-slate-600">Instructions: {m.instructions}</p> : null}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 text-sm">
                <p>
                  <span className="font-semibold">Symptoms:</span>{' '}
                  {selectedSymptomIds.map((id) => symptomNameById.get(id)).join(', ')}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Notes:</span> {notes || '-'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2" onClick={() => setShowPreview(false)}>
                Back
              </button>
              <button
                type="button"
                className="rounded-md bg-teal-700 px-4 py-2 text-white disabled:opacity-50"
                onClick={submit}
                disabled={loading}
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default PrescriptionBuilder;

