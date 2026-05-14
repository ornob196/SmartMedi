// ─── Prescription Routes (PostgreSQL / Sequelize) ─────────────────────────────
// Handles prescription creation (saved to DB), fetching, and PDF download.
// POST /api/prescriptions         → doctor creates prescription (SAVED TO DB)
// GET /api/prescriptions/my       → patient views own prescriptions
// GET /api/prescriptions/doctor   → doctor views given prescriptions
// GET /api/prescriptions/:id/pdf  → download prescription as PDF

const express = require('express');
const PDFDocument = require('pdfkit');
const { Prescription, Doctor, Patient, Appointment } = require('../models');
const { protect, patientOnly, doctorOnly } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/prescriptions
// Doctor: Create a prescription (saves to PostgreSQL)
// medicines field: array of { name, dosage, frequency, duration, instructions }
// vitals field: { bp, pulse, temperature, weight, height, spo2 }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, doctorOnly, async (req, res) => {
  try {
    const { appointmentId, patientId, diagnosis, symptoms, vitals, medicines, notes, followUpDate, labTests, aiSuggestions } = req.body;
    if (!patientId || !medicines || medicines.length === 0)
      return res.status(400).json({ success: false, message: 'Patient ID and at least one medicine are required' });

    const prescription = await Prescription.create({
      appointmentId: appointmentId || null,
      doctorId: req.user.id,
      patientId,
      diagnosis: diagnosis || '',
      symptoms: symptoms || '',
      vitals: vitals || {},
      medicines: medicines || [],
      notes: notes || '',
      followUpDate: followUpDate || null,
      labTests: labTests || '',
      aiSuggestions: aiSuggestions || '',
    });

    // If linked to appointment, mark it as completed
    if (appointmentId) {
      await Appointment.update({ status: 'completed' }, { where: { id: appointmentId } });
    }

    const full = await Prescription.findByPk(prescription.id, {
      include: [
        { model: Doctor, as: 'doctor', attributes: ['name', 'specialty', 'phone', 'email', 'hospital'] },
        { model: Patient, as: 'patient', attributes: ['name', 'age', 'sex', 'phone', 'email'] },
      ],
    });

    res.status(201).json({ success: true, message: '✅ Prescription saved to database', prescription: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/my
// Patient: View own prescriptions (most recent first)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my', protect, patientOnly, async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.user.id },
      include: [
        { model: Doctor, as: 'doctor', attributes: ['name', 'specialty', 'phone', 'email', 'profilePhoto', 'hospital'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/doctor
// Doctor: View all prescriptions they've written
// ─────────────────────────────────────────────────────────────────────────────
router.get('/doctor', protect, doctorOnly, async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { doctorId: req.user.id },
      include: [
        { model: Patient, as: 'patient', attributes: ['name', 'age', 'sex', 'phone', 'email', 'profilePhoto'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/:id/pdf
// Download a prescription as a styled PDF file
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        { model: Doctor, as: 'doctor', attributes: ['name', 'specialty', 'phone', 'email', 'hospital'] },
        { model: Patient, as: 'patient', attributes: ['name', 'age', 'sex', 'phone', 'email'] },
      ],
    });
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescription.id}.pdf`);
    doc.pipe(res);

    // ── PDF Header ──
    doc.fontSize(24).fillColor('#667eea').text('💊 SMARTMEDI', { align: 'center' });
    doc.fontSize(12).fillColor('#666').text('Smart Health Management System', { align: 'center' });
    doc.moveDown().moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#667eea').stroke().moveDown();

    // ── Date & ID ──
    doc.fontSize(10).fillColor('#999')
      .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' })
      .text(`Prescription ID: ${prescription.id}`, { align: 'right' });
    doc.moveDown();

    // ── Doctor Info ──
    doc.fontSize(13).fillColor('#198754').text('Doctor Information');
    doc.fontSize(11).fillColor('#333')
      .text(`Name: Dr. ${prescription.doctor.name}`)
      .text(`Specialty: ${prescription.doctor.specialty}`)
      .text(`Hospital: ${prescription.doctor.hospital || 'N/A'}`)
      .text(`Contact: ${prescription.doctor.phone} | ${prescription.doctor.email}`);
    doc.moveDown();

    // ── Patient Info ──
    doc.fontSize(13).fillColor('#0d6efd').text('Patient Information');
    doc.fontSize(11).fillColor('#333')
      .text(`Name: ${prescription.patient.name}`)
      .text(`Age: ${prescription.patient.age} | Sex: ${prescription.patient.sex}`)
      .text(`Contact: ${prescription.patient.phone}`);
    doc.moveDown();

    // ── Vitals ──
    if (prescription.vitals && Object.keys(prescription.vitals).length > 0) {
      doc.fontSize(13).fillColor('#6610f2').text('Vitals');
      const v = prescription.vitals;
      const vitalsText = [
        v.bp && `BP: ${v.bp}`, v.pulse && `Pulse: ${v.pulse}`,
        v.temperature && `Temp: ${v.temperature}`, v.weight && `Weight: ${v.weight} kg`,
        v.height && `Height: ${v.height} cm`, v.spo2 && `SpO2: ${v.spo2}`,
      ].filter(Boolean).join('  |  ');
      doc.fontSize(11).fillColor('#333').text(vitalsText);
      doc.moveDown();
    }

    // ── Diagnosis ──
    if (prescription.diagnosis) {
      doc.fontSize(13).fillColor('#dc3545').text('Diagnosis');
      doc.fontSize(11).fillColor('#333').text(prescription.diagnosis);
      doc.moveDown();
    }

    // ── Medicines ──
    doc.fontSize(13).fillColor('#dc3545').text('Prescribed Medicines');
    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach((med, i) => {
        doc.fontSize(11).fillColor('#333')
          .text(`${i + 1}. ${med.name} — ${med.dosage} | ${med.frequency} | ${med.duration}`)
          .fontSize(10).fillColor('#666').text(`   Instructions: ${med.instructions || 'As directed'}`);
      });
    }
    doc.moveDown();

    // ── Doctor Notes ──
    if (prescription.notes) {
      doc.fontSize(13).fillColor('#6c757d').text("Doctor's Notes / Advice");
      doc.fontSize(11).fillColor('#333').text(prescription.notes);
      doc.moveDown();
    }

    // ── Follow-up ──
    if (prescription.followUpDate) {
      doc.fontSize(11).fillColor('#0d6efd').text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString('en-GB')}`);
      doc.moveDown();
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke().moveDown();
    doc.fontSize(9).fillColor('#aaa').text('This prescription was generated by SMARTMEDI. For queries: info@smartmedi.com', { align: 'center' });
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
