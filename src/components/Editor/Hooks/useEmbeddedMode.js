/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setEmbedded } from '../EditorSlice'

export const useEmbeddedMode = (embed = false) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (embed) {
      dispatch(setEmbedded());
    }
  }, []);
};
