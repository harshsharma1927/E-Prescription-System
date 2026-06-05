import { useMemo, useState } from 'react';
import Card from './Card';

function CatalogManager({
  symptoms,
  medicines,
  onCreateSymptom,
  onDeleteSymptom,
  onCreateMedicine,
  onDeleteMedicine,
  onCreateMapping,
  loading,
}) {
  const [symptomForm, setSymptomForm] = useState({ name: '', category: '' });
  const [medicineForm, setMedicineForm] = useState({ name: '', category: '' });
  const [mapping, setMapping] = useState({ symptom_id: '', medicine_id: '' });

  const sortedSymptoms = useMemo(() => [...symptoms].sort((a, b) => a.name.localeCompare(b.name)), [symptoms]);
  const sortedMedicines = useMemo(() => [...medicines].sort((a, b) => a.name.localeCompare(b.name)), [medicines]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Symptoms">
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Symptom name"
            value={symptomForm.name}
            onChange={(e) => setSymptomForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Category"
            value={symptomForm.category}
            onChange={(e) => setSymptomForm((s) => ({ ...s, category: e.target.value }))}
          />
          <button
            className="rounded-md border border-slate-300 px-3 py-1"
            type="button"
            disabled={loading}
            onClick={async () => {
              await onCreateSymptom(symptomForm);
              setSymptomForm({ name: '', category: '' });
            }}
          >
            Add Symptom
          </button>
        </div>
        <div className="mt-3 max-h-64 space-y-1 overflow-auto text-sm">
          {sortedSymptoms.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
              <span>{s.name}</span>
              <button className="text-red-600" type="button" onClick={() => onDeleteSymptom(s.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Medicines">
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Medicine name"
            value={medicineForm.name}
            onChange={(e) => setMedicineForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Category"
            value={medicineForm.category}
            onChange={(e) => setMedicineForm((s) => ({ ...s, category: e.target.value }))}
          />
          <button
            className="rounded-md border border-slate-300 px-3 py-1"
            type="button"
            disabled={loading}
            onClick={async () => {
              await onCreateMedicine(medicineForm);
              setMedicineForm({ name: '', category: '' });
            }}
          >
            Add Medicine
          </button>
        </div>
        <div className="mt-3 max-h-64 space-y-1 overflow-auto text-sm">
          {sortedMedicines.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
              <span>{m.name}</span>
              <button className="text-red-600" type="button" onClick={() => onDeleteMedicine(m.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Symptom -> Medicine Mapping">
        <div className="space-y-2 text-sm">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={mapping.symptom_id}
            onChange={(e) => setMapping((s) => ({ ...s, symptom_id: e.target.value }))}
          >
            <option value="">Select symptom</option>
            {sortedSymptoms.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={mapping.medicine_id}
            onChange={(e) => setMapping((s) => ({ ...s, medicine_id: e.target.value }))}
          >
            <option value="">Select medicine</option>
            {sortedMedicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-md border border-slate-300 px-3 py-1"
            type="button"
            disabled={loading || !mapping.symptom_id || !mapping.medicine_id}
            onClick={async () => {
              await onCreateMapping(mapping);
              setMapping({ symptom_id: '', medicine_id: '' });
            }}
          >
            Create Mapping
          </button>
        </div>
      </Card>
    </div>
  );
}

export default CatalogManager;

