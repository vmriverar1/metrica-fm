'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Directus configuration
const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVhMjg1M2IyLTNlOWEtNDcxZS1iZDEyLWFiYmI0OWUyOWZhMiIsInJvbGUiOiJiMjhhYjAyNS05ZmNiLTRkZGEtOTUwYS1iNWI5OTVkYzI2YjIiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTc1NTU5NzY0OCwiZXhwIjoxNzU1NTk4NTQ4LCJpc3MiOiJkaXJlY3R1cyJ9.D4l2pf23ajMuxshT5YJk4XBVJV0BtfiJNo2LPhCm86w';

// Types
interface TestProduct {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  is_active?: boolean;
  created_at?: string;
}

export default function CRUDTestPage() {
  const [products, setProducts] = useState<TestProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TestProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState<TestProduct>({
    name: '',
    description: '',
    price: 0,
    category: 'electronics',
    is_active: true
  });

  // API instance
  const api = axios.create({
    baseURL: DIRECTUS_URL,
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  // READ: Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items/test_products');
      setProducts(response.data.data || []);
      setMessage('✅ Products fetched successfully');
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('❌ Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  // CREATE: Add new product
  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/items/test_products', formData);
      
      await fetchProducts(); // Refresh list
      resetForm();
      setMessage(`✅ Product "${formData.name}" created successfully`);
    } catch (error) {
      console.error('Error creating product:', error);
      setMessage('❌ Error creating product');
    } finally {
      setLoading(false);
    }
  };

  // UPDATE: Edit existing product
  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?.id) return;
    
    try {
      setLoading(true);
      await api.patch(`/items/test_products/${selectedProduct.id}`, formData);
      
      await fetchProducts(); // Refresh list
      setIsEditing(false);
      setSelectedProduct(null);
      resetForm();
      setMessage(`✅ Product updated successfully`);
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage('❌ Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // DELETE: Remove product
  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      setLoading(true);
      await api.delete(`/items/test_products/${id}`);
      
      await fetchProducts(); // Refresh list
      setMessage(`✅ Product "${name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('❌ Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const editProduct = (product: TestProduct) => {
    setSelectedProduct(product);
    setFormData(product);
    setIsEditing(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'electronics',
      is_active: true
    });
    setIsEditing(false);
    setSelectedProduct(null);
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Directus CRUD Test Module</h1>
          <p className="text-gray-600 mb-4">Complete testing of Create, Read, Update, Delete operations with Directus CMS</p>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CREATE/UPDATE FORM */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? '✏️ Update Product' : '➕ Create New Product'}
            </h2>
            
            <form onSubmit={isEditing ? updateProduct : createProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category || 'electronics'}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                    <option value="home">Home</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Product</span>
                  </label>
                </div>
              </div>


              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? '⏳ Processing...' : (isEditing ? '💾 Update Product' : '✨ Create Product')}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* READ: PRODUCTS LIST */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🛒 Products ({products.length})</h2>
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No products found. Create your first product!</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span className="font-semibold text-green-600">${product.price}</span>
                          <span className={`px-2 py-1 rounded ${
                            product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{product.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id!, product.name)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CRUD OPERATIONS SUMMARY */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">🛠️ CRUD Operations Summary</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">✨ CREATE</h3>
              <p className="text-sm text-green-600">Add new products with complete form validation</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">📖 READ</h3>
              <p className="text-sm text-blue-600">Fetch and display products with real-time refresh</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">✏️ UPDATE</h3>
              <p className="text-sm text-orange-600">Edit existing products with pre-filled forms</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">🗑️ DELETE</h3>
              <p className="text-sm text-red-600">Remove products with confirmation dialog</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}