const { Router } = require('express');

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const prescriptionRoutes = require('./prescription.routes');
const medicineRoutes = require('./medicine.routes');
const symptomRoutes = require('./symptom.routes');
const symptomMedicineRoutes = require('./symptomMedicine.routes');

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/medicines', medicineRoutes);
apiRouter.use('/symptoms', symptomRoutes);
apiRouter.use('/symptom-medicines', symptomMedicineRoutes);

module.exports = { apiRouter };

