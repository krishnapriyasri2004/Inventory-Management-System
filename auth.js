import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Package, Plus, Minus, Edit2, Trash2, LogOut, Search } from 'lucide-react';

const AuthInventorySystem = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth form states
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [authError, setAuthError] = useState('');
  
  // Inventory form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    quantity: '',
    price: '',
    category: ''
  });

  // Load data from storage on mount
  useEffect(() => {
    loadUserData();
    loadInventoryData();
  }, [user]);

  const loadUserData = async () => {
    try {
      const result = await window.storage.get('current_user');
      if (result) {
        setUser(JSON.parse(result.value));
        setCurrentView('inventory');
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const loadInventoryData = async () => {
    if (!user) return;
    try {
      const result = await window.storage.get(`inventory_${user.id}`);
      if (result) {
        setInventory(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No inventory data');
    }
  };

  const saveInventoryData = async (data) => {
    if (!user) return;
    try {
      await window.storage.set(`inventory_${user.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  };

  // Auth functions
  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    
    if (authForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    try {
      // Check if user exists
      const existingUser = await window.storage.get(`user_${authForm.email}`);
      if (existingUser) {
        setAuthError('User already exists');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email: authForm.email,
        name: authForm.name,
        password: authForm.password,
        createdAt: new Date().toISOString()
      };

      await window.storage.set(`user_${authForm.email}`, JSON.stringify(newUser));
      await window.storage.set('current_user', JSON.stringify(newUser));
      
      setUser(newUser);
      setCurrentView('inventory');
      setAuthForm({ email: '', password: '', confirmPassword: '', name: '' });
    } catch (error) {
      setAuthError('Sign up failed. Please try again.');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const result = await window.storage.get(`user_${authForm.email}`);
      if (!result) {
        setAuthError('User not found');
        return;
      }

      const userData = JSON.parse(result.value);
      if (userData.password !== authForm.password) {
        setAuthError('Invalid password');
        return;
      }

      await window.storage.set('current_user', JSON.stringify(userData));
      setUser(userData);
      setCurrentView('inventory');
      setAuthForm({ email: '', password: '', confirmPassword: '', name: '' });
    } catch (error) {
      setAuthError('Sign in failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('current_user');
      setUser(null);
      setInventory([]);
      setCurrentView('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Inventory functions
  const handleAddItem = async () => {
    if (!itemForm.name || !itemForm.quantity || !itemForm.price || !itemForm.category) return;
    
    const newItem = {
      id: Date.now().toString(),
      ...itemForm,
      quantity: parseInt(itemForm.quantity),
      price: parseFloat(itemForm.price),
      addedAt: new Date().toISOString()
    };
    
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    await saveInventoryData(updatedInventory);
    
    setItemForm({ name: '', quantity: '', price: '', category: '' });
    setShowAddModal(false);
  };

  const handleUpdateItem = async () => {
    if (!itemForm.name || !itemForm.quantity || !itemForm.price || !itemForm.category) return;
    
    const updatedInventory = inventory.map(item =>
      item.id === editingItem.id
        ? { ...item, ...itemForm, quantity: parseInt(itemForm.quantity), price: parseFloat(itemForm.price) }
        : item
    );
    
    setInventory(updatedInventory);
    await saveInventoryData(updatedInventory);
    
    setEditingItem(null);
    setItemForm({ name: '', quantity: '', price: '', category: '' });
  };

  const handleDeleteItem = async (id) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    await saveInventoryData(updatedInventory);
  };

  const adjustQuantity = async (id, change) => {
    const updatedInventory = inventory.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    );
    setInventory(updatedInventory);
    await saveInventoryData(updatedInventory);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Render Auth Views
  if (currentView === 'login' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to manage your inventory</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <button
              onClick={handleSignIn}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setCurrentView('signup');
                  setAuthError('');
                }}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'signup' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600 mt-2">Start managing your inventory today</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={authForm.name}
                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <button
              onClick={handleSignUp}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setCurrentView('login');
                  setAuthError('');
                }}
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Inventory View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Inventory Manager</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{inventory.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Total Quantity</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Total Value</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">${totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No items in inventory</p>
              <p className="text-gray-500 text-sm mt-2">Add your first item to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustQuantity(item.id, -1)}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold text-gray-800 w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => adjustQuantity(item.id, 1)}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-800">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm({
                                name: item.name,
                                quantity: item.quantity.toString(),
                                price: item.price.toString(),
                                category: item.category
                              });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Laptop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={itemForm.category}
                  onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({...itemForm, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    setItemForm({ name: '', quantity: '', price: '', category: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthInventorySystem;