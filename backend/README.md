# Prescription Management System (Backend)

Tech: `Node.js` + `Express` + `MongoDB/Mongoose` + `JWT` + `Nodemailer` + `Cloudinary` + `PDFKit`

## Run
1. `cd c:\Prescription\backend`
2. `npm install`
3. Create `.env` (copy from `.env.example`) and fill secrets
4. `npm run dev`

Health: `GET /api/health`

## Auth
`POST /api/auth/register` then `POST /api/auth/login` (returns JWT token).
Use header: `Authorization: Bearer <token>` for doctor-protected endpoints.

## Core Guarantees
- `Patient.reference_id` is generated only once.
- If patient already exists (by `phone` or `email`), the same `reference_id` is reused.
- Every prescription is linked to the same patient for full history continuity.
- PDF includes a bold, visible `Reference ID` at the top.
- Email sends the PDF as an attachment (no Cloudinary link).

