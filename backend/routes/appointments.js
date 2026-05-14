// ─── Appointment Routes (PostgreSQL / Sequelize) ──────────────────────────────
// Handles booking, listing, status updates for appointments.
// Real-time: appointments are fetched live from PostgreSQL (doctors from DB).
// meetLink: generated when doctor confirms appointment.

const express = require('express');
const { Op } = require('sequelize');
const { Appointment, Doctor, Patient } = require('../models');
const { protect, patientOnly, doctorOnly } = require('../middleware/auth');

const router = express.Router();

// ── Helper: generate a Google Meet style link ──────────────────────────────────
const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${seg()}-${seg()}-${seg()}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments
// Patient: Book a new appointment
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, patientOnly, async (req, res) => {
  try {
    const { service, doctorId, appointmentDate, timeSlot, age, bloodType, symptoms, medicalHistory } = req.body;
    if (!service || !doctorId || !appointmentDate || !timeSlot || !age || !symptoms)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    // Validate date is not in the past
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(appointmentDate) < today)
      return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past' });

    // Find doctor in DB
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Check duplicate booking (same doctor, date, time slot)
    const duplicate = await Appointment.findOne({
      where: { doctorId, appointmentDate, timeSlot },
    });
    if (duplicate)
      return res.status(409).json({ success: false, message: 'This time slot is already booked for the selected doctor' });

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      doctorName: doctor.name,
      service, appointmentDate, timeSlot,
      age, bloodType: bloodType || '',
      symptoms, medicalHistory: medicalHistory || '',
    });

    res.status(201).json({ success: true, message: '✅ Appointment booked successfully!', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/my
// Patient: Get own appointments with doctor info
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my', protect, patientOnly, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [{
        model: Doctor, as: 'doctor',
        attributes: ['id', 'name', 'specialty', 'profilePhoto', 'phone', 'email'],
      }],
      order: [['appointmentDate', 'DESC'], ['timeSlot', 'ASC']],
    });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/doctor
// Doctor: Get own appointments with patient info
// ─────────────────────────────────────────────────────────────────────────────
router.get('/doctor', protect, doctorOnly, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.user.id },
      include: [{
        model: Patient, as: 'patient',
        attributes: ['id', 'name', 'age', 'sex', 'phone', 'email', 'profilePhoto'],
      }],
      order: [['appointmentDate', 'DESC'], ['timeSlot', 'ASC']],
    });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/appointments/:id/status
// Doctor: Update appointment status
// When confirming → auto-generate Google Meet link
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', protect, doctorOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, doctorId: req.user.id },
    });
    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    const updates = { status };

    // ── Auto-generate Google Meet link when confirmed ──
    if (status === 'confirmed' && !appointment.meetLink) {
      updates.meetLink = generateMeetLink();
    }

    await appointment.update(updates);
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/appointments/:id
// Patient: Cancel own appointment
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, patientOnly, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, patientId: req.user.id },
    });
    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    await appointment.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/slots/:doctorId
// Public: Get booked time slots for a specific doctor on a date
// ─────────────────────────────────────────────────────────────────────────────
router.get('/slots/:doctorId', async (req, res) => {
  try {
    const { date } = req.query;
    const booked = await Appointment.findAll({
      where: {
        doctorId: req.params.doctorId,
        appointmentDate: date,
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: ['timeSlot'],
    });
    res.json({ success: true, bookedSlots: booked.map(a => a.timeSlot) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
