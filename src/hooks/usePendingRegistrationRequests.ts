// hooks/usePendingRegistrationRequests.ts
import { useState, useEffect } from 'react';
import { registrationApi } from '@/lib/registration/registration.api';

export const usePendingRegistrationRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPendingCount = async () => {
    try {
      setLoading(true);
      const requests = await registrationApi.getAll();
      const count = requests.filter(r => r.status === 0).length;
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to fetch pending registration requests:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { pendingCount, refresh: fetchPendingCount, loading };
};

