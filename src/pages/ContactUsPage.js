import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Card';

const ContactUsPage = () => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/contact', form);
      showNotification('Message sent!', 'success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      showNotification('Failed to send message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input type="text" name="name" id="name" value={form.name} onChange={handleChange} className="mt-1 block w-full" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input type="email" name="email" id="email" value={form.email} onChange={handleChange} className="mt-1 block w-full" required />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea name="message" id="message" value={form.message} onChange={handleChange} rows="5" className="mt-1 block w-full" required></textarea>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-light-accent text-white py-3 rounded-md min-h-[44px] disabled:opacity-50">
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ContactUsPage;
