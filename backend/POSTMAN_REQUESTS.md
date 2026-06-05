# Prescription Management System - Sample Postman Requests

Base URL: `http://localhost:5000/api`

## 1) Auth

### Register Doctor
`POST /auth/register`

Body (JSON):
```json
{
  "name": "Dr. Asha Rao",
  "email": "doctor@example.com",
  "password": "StrongPassword123",
  "clinicName": "Rao Clinic",
  "clinicAddress": "123 Main St",
  "clinicPhone": "+911234567890"
}
```

### Login Doctor
`POST /auth/login`

Body (JSON):
```json
{
  "email": "doctor@example.com",
  "password": "StrongPassword123"
}
```

Response will include a `token`. Copy it and set:
- Header `Authorization: Bearer <token>`

## 2) Symptoms CRUD

### Create Symptom
`POST /symptoms`

Body:
```json
{
  "name": "Headache",
  "category": "Neurology"
}
```

### List Symptoms
`GET /symptoms`

## 3) Medicines CRUD

### Create Medicine
`POST /medicines`

Body:
```json
{
  "name": "Paracetamol",
  "category": "Analgesic"
}
```

### List Medicines
`GET /medicines`

## 4) Map Symptoms -> Medicines

### Create Mapping
`POST /symptom-medicines`

Body:
```json
{
  "symptom_id": "SYMPTOM_OBJECT_ID",
  "medicine_id": "MEDICINE_OBJECT_ID"
}
```

### Bulk Create Mappings
`POST /symptom-medicines/bulk`

Body:
```json
{
  "mappings": [
    { "symptom_id": "SYM1", "medicine_id": "MED1" },
    { "symptom_id": "SYM1", "medicine_id": "MED2" }
  ]
}
```

## 5) Get Medicines by Symptoms (Doctor Flow)

### Fetch Medicines for Selected Symptoms
`POST /medicines/by-symptoms`

Body:
```json
{
  "symptomIds": ["SYMPTOM_OBJECT_ID_1", "SYMPTOM_OBJECT_ID_2"]
}
```

## 6) Create Prescription (PDF + Cloudinary + Email)

### Create Prescription
`POST /prescriptions`

Body:
```json
{
  "patient": {
    "phone": "+919999999999",
    "email": "patient@example.com",
    "name": "Rahul Sharma",
    "age": 34,
    "gender": "Male"
  },
  "symptom_ids": ["SYMPTOM_OBJECT_ID_1", "SYMPTOM_OBJECT_ID_2"],
  "medicines": [
    {
      "medicine_id": "MEDICINE_OBJECT_ID_1",
      "dosage": "500 mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "potency": "N/A",
      "instructions": "After food"
    }
  ],
  "notes": "Rest well and maintain hydration."
}
```

Response:
```json
{
  "status": "success",
  "prescription_id": "PRESCRIPTION_OBJECT_ID",
  "patient_reference_id": "RX-20260320-ABCDEF123456",
  "created_at": "2026-03-20T12:34:56.000Z"
}
```

## 7) Patient Retrieval

### Search Patient
`GET /patients/search?phone=+919999999999`

Or:
`GET /patients/search?reference_id=RX-...`

### Get Patient by Reference ID
`GET /patients/:referenceId`

Example:
`GET /patients/RX-20260320-ABCDEF123456`

### Get Full Patient History (Latest First)
`GET /patients/:referenceId/history`

## 8) Secure PDF Fetch (Doctor Only)

### Download PDF
`GET /prescriptions/:id/pdf`

Headers:
- `Authorization: Bearer <token>`

