import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('spots')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setSpots(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSpots(); }, [fetchSpots]);

  return { spots, loading, error, refetch: fetchSpots };
}

export async function createSpot(spotData) {
  const { data, error } = await supabase
    .from('spots')
    .insert(spotData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSpot(id, spotData) {
  const { data, error } = await supabase
    .from('spots')
    .update({ ...spotData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSpot(id) {
  const { error } = await supabase.from('spots').delete().eq('id', id);
  if (error) throw error;
}
