
const Contact = require('../models/Contact');

exports.submitContactForm = async (req, res) => {
  try {
    await Contact.create(req.body);
    res.status(201).json({ success: true, message: 'Message received!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
