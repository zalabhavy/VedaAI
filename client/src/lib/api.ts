const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  async getAssignments() {
    const res = await fetch(`${API_URL}/api/assignments`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  },

  async getAssignment(id: string) {
    const res = await fetch(`${API_URL}/api/assignments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch assignment');
    return res.json();
  },

  async createAssignment(data: any, file?: File) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (file) formData.append('file', file);

    const res = await fetch(`${API_URL}/api/assignments`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    return res.json();
  },

  async regenerate(id: string) {
    const res = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate');
    return res.json();
  },

  async deleteAssignment(id: string) {
    const res = await fetch(`${API_URL}/api/assignments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete');
    return res.json();
  },
};
