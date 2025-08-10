import { useEffect, useState } from 'react';
import {
  getReferences,
  addReference,
  deleteReference,
  updateReference,
} from '../../api/referralManagerApi.js';

const ReferenceManager = () => {
  const [references, setReferences] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', type: 'Doctor' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    const data = await getReferences();
    setReferences(data);
    setFiltered(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateReference(editId, form);
        alert('Reference updated successfully');
      } else {
        await addReference(form);
        alert('Reference added successfully');
      }
      setForm({ name: '', code: '', type: 'Doctor' });
      setEditId(null);
      loadReferences();
    } catch (err) {
      if (err.response?.status === 409) {
        alert('A reference with this code already exists. Please use a different code.');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this reference?');
    if (confirm) {
      try {
        await deleteReference(id);
        alert('Reference deleted successfully');
        loadReferences();
      } catch {
        alert('Failed to delete the reference.');
      }
    }
  };

  const handleEdit = (ref) => {
    setForm({ name: ref.name, code: ref.code, type: ref.type });
    setEditId(ref.id);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filteredData = references.filter((ref) =>
      ref.name.toLowerCase().includes(value) ||
      ref.code.toLowerCase().includes(value) ||
      ref.type.toLowerCase().includes(value)
    );
    setFiltered(filteredData);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reference Manager</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name, code, or type..."
        value={search}
        onChange={handleSearch}
        className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid gap-3 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded w-full"
          required
        >
          <option value="Doctor">Doctor</option>
          <option value="PC">PC</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {editId ? 'Update Reference' : 'Add Reference'}
        </button>
      </form>

      {/* Reference List */}
      <ul className="space-y-3">
        {filtered.length === 0 && <p className="text-gray-500 text-center">No references found.</p>}
        {filtered.map((ref) => (
          <li
            key={ref.id}
            className="flex justify-between items-center p-3 bg-gray-50 border rounded hover:shadow-sm"
          >
            <div className="text-sm text-gray-700">
              <strong className="text-gray-900">{ref.name}</strong> ({ref.code}) - {ref.type}
            </div>
            <div className="space-x-2 text-sm">
              <button
                onClick={() => handleEdit(ref)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(ref.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReferenceManager;
