import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setRoutes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  return { routes, loading, error, refetch: fetchRoutes };
}

export async function createRoute(routeData) {
  const { data, error } = await supabase
    .from('routes')
    .insert(routeData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoute(id, routeData) {
  const { data, error } = await supabase
    .from('routes')
    .update(routeData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoute(id) {
  const { error } = await supabase.from('routes').delete().eq('id', id);
  if (error) throw error;
}
