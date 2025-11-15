import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Search, Package, X, AlertCircle, LogOut, User, Mail, Lock, Eye, EyeOff, TrendingUp, CheckCircle } from 'lucide-react';

// =====================================================
// 🔗 GLOBAL API BASE URL (USE YOUR RENDER BACKEND)
// =====================================================
const API_BASE = "https://inventory-management-system-lers.onrender.com/api";

// ============ AUTH CONTEXT ============

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ============ INVENTORY CONTEXT ============

const InventoryContext = createContext();

const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const API_URL = API_BASE;

  const fetchItems = async (category = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = category ? `${API_URL}/items?category=${category}` : `${API_URL}/items`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        setItems(data.items);
      } else {
        setError(data.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError('Network error. Please ensure backend is online.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData),
      });
      const data = await response.json();

      if (response.ok) {
        setItems([data.item, ...items]);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData),
      });
      const data = await response.json();

      if (response.ok) {
        setItems(items.map(item => item._id === id ? data.item : item));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== id));
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <InventoryContext.Provider value={{ items, loading, error, fetchItems, addItem, updateItem, deleteItem }}>
      {children}
    </InventoryContext.Provider>
  );
};

const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};

// ============ AUTH COMPONENTS ============

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin && formData.password.length < 6) newErrors.password = 'Password too short';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setErrors({ submit: data.error || 'Authentication failed' });
      }
    } catch {
      setErrors({ submit: 'Network error. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Manager</h1>
          <p className="text-gray-600">Manage your inventory with ease</p>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                isLogin ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !isLogin ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg mb-4">
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

// ============ INVENTORY COMPONENTS ============

const ItemForm = ({ editingItem, onClose, onSuccess }) => {
  const { addItem, updateItem } = useInventory();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    price: '',
    description: '',
    category: 'Electronics',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        itemName: editingItem.itemName,
        quantity: editingItem.quantity,
        price: editingItem.price,
        description: editingItem.description || '',
        category: editingItem.category,
      });
    }
  }, [editingItem]);

  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Tools', 'Other'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name required';
    if (formData.quantity === '' || formData.quantity < 0) newErrors.quantity = 'Enter quantity';
    if (formData.price === '' || formData.price < 0) newErrors.price = 'Enter price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    const itemData = {
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
    };

    const result = editingItem
      ? await updateItem(editingItem._id, itemData)
      : await addItem(itemData);

    setSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </h2>

        {errors.submit && (
          <div className="bg-red-50 p-3 rounded text-red-700 mb-3">
            {errors.submit}
          </div>
        )}

        <div className="space-y-3">
          <input className="border p-3 w-full rounded"
            name="itemName" value={formData.itemName} placeholder="Item Name"
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} />

          <input className="border p-3 w-full rounded" type="number"
            name="quantity" value={formData.quantity} placeholder="Quantity"
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />

          <input className="border p-3 w-full rounded" type="number"
            name="price" value={formData.price} placeholder="Price"
            onChange={(e) => setFormData({ ...formData, price: e.target.value })} />

          <textarea className="border p-3 w-full rounded"
            name="description" placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

          <select className="border p-3 w-full rounded"
            name="category" value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border p-3 rounded">
            Cancel
          </button>

          <button onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white p-3 rounded">
            {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white border rounded-xl p-4 shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{item.itemName}</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="text-blue-600">
            <Edit size={18} />
          </button>
          <button onClick={() => onDelete(item._id)} className="text-red-600">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">Category: {item.category}</p>
      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
      <p className="text-sm text-gray-600">Price: ${item.price}</p>

      {item.description && (
        <p className="text-xs text-gray-500 mt-2">{item.description}</p>
      )}
    </div>
  );
};

const InventoryApp = () => {
  const { items, loading, error, fetchItems, deleteItem } = useInventory();
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter(i =>
    i.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10 p-4 flex justify-between">
        <h1 className="text-xl font-bold">Inventory Manager</h1>
        <div className="flex items-center gap-4">
          <span>Hello, {user.username}</span>
          <button onClick={logout} className="border px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </header>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search items..."
            className="border p-3 w-full max-w-sm rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={() => { setEditingItem(null); setShowForm(true); }}
            className="ml-4 bg-blue-600 text-white px-4 py-3 rounded"
          >
            + Add Item
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 p-3 rounded text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* LISTING */}
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-600">No items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                onEdit={(it) => { setEditingItem(it); setShowForm(true); }}
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <ItemForm
          editingItem={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => fetchItems()}
        />
      )}
    </div>
  );
};

// ============ MAIN APP ============

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <InventoryProvider>
      <InventoryApp />
    </InventoryProvider>
  );
}
