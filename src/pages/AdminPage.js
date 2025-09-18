import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import Card from '../components/Card';
import { useNotification } from '../context/NotificationContext';
import { useFeatures } from '../context/FeatureContext';

const AdminPage = () => {
  const { showNotification } = useNotification();
  const { featureFlags, fetchFeatureFlags, updateFeatureFlag } = useFeatures();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFeatureName, setNewFeatureName] = useState('');

  const fetchFeaturesCallback = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/features');
      setFeatures(res.data || []);
    } catch (err) {
      showNotification('Failed to fetch feature flags', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchFeaturesCallback();
  }, [fetchFeaturesCallback]);

  const handleAddFeature = async (e) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    try {
      const res = await axios.post('/admin/features', { name: newFeatureName, isEnabled: true });
      showNotification('Feature added', 'success');
      setNewFeatureName('');
      setFeatures(prevFeatures => [...prevFeatures, res.data]);
      updateFeatureFlag(res.data.name, res.data.isEnabled);
    } catch (err) {
      showNotification(err.response?.data?.msg || 'Failed to add feature', 'error');
    }
  };

  const handleToggleFeature = async (feature) => {
    try {
      const res = await axios.put(`/admin/features/${feature._id}`, { isEnabled: !feature.isEnabled, name: feature.name });
      showNotification('Feature updated', 'success');
      setFeatures(prevFeatures => prevFeatures.map(f => f._id === feature._id ? res.data : f));
      updateFeatureFlag(res.data.name, res.data.isEnabled);
    } catch (err) {
      showNotification('Failed to update feature', 'error');
    }
  };

  const handleDeleteFeature = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/admin/features/${id}`);
      showNotification('Feature deleted', 'success');
      const deletedFeature = features.find(f => f._id === id);
      setFeatures(prevFeatures => prevFeatures.filter(f => f._id !== id));
      if (deletedFeature) {
        updateFeatureFlag(deletedFeature.name, false); // Assuming deletion means disabling the feature
      }
    } catch (err) {
      showNotification('Failed to delete feature', 'error');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin - Feature Management</h1>
      <Card>
        <form onSubmit={handleAddFeature} className="flex items-center space-x-4 mb-6">
          <input type="text" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} placeholder="New feature name" className="flex-grow" />
          <button type="submit" className="bg-light-accent text-white px-4 py-2 rounded-md min-h-[44px]">Add</button>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-light-border dark:border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {features.map(feature => (
                <tr key={feature._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{feature.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${feature.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{feature.isEnabled ? 'Enabled' : 'Disabled'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleToggleFeature(feature)} className="text-light-accent dark:text-dark-accent">Toggle</button>
                    <button onClick={() => handleDeleteFeature(feature._id)} className="text-light-error dark:text-dark-error">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;