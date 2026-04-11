const API_BASE = (import.meta.env.VUE_APP_API_URL || '').replace(/\/+$/, '');

class AIMeasureService {
  async measureSurface({ imageFile, referenceDimensionCm, pricePerM2 }) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('reference_dimension_cm', String(referenceDimensionCm));
    formData.append('price_per_m2', String(pricePerM2 || 0));

    const response = await fetch(`${API_BASE}/v1/measure/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'AI measure request failed');
    }

    return response.json();
  }
}

export default new AIMeasureService();
