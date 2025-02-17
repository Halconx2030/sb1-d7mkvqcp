import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Users, Settings, Activity, Clock, Search } from 'lucide-react';

interface User {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  access_level: 'basic' | 'premium' | 'pro' | null;
  email: string | null;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: {
    table: string;
    old_data?: Record<string, any>;
    new_data?: Record<string, any>;
  };
  created_at: string;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadUsers(), loadLogs()]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setLogs(data || []);
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError('Error al actualizar el usuario. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdateAccessLevel = async (userId: string, level: User['access_level']) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('user_profiles')
        .update({ access_level: level })
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error al actualizar nivel de acceso:', error);
      setError('Error al actualizar el nivel de acceso. Por favor, intenta de nuevo.');
    }
  };

  const formatLogDetails = (details: AuditLog['details']) => {
    if (!details) return null;

    const { table, old_data, new_data } = details;

    const formatValue = (value: any) => {
      if (value === null) return <span className="text-gray-400">null</span>;
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      if (Array.isArray(value)) return value.join(', ') || '[]';
      return String(value);
    };

    const renderDataGrid = (data: Record<string, any> | undefined, title: string) => {
      if (!data) return null;
      
      return (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(data).map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{key}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{formatValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">Tabla:</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{table}</span>
        </div>

        {old_data && new_data ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              {renderDataGrid(old_data, "Datos Anteriores")}
            </div>
            <div className="space-y-2">
              {renderDataGrid(new_data, "Datos Nuevos")}
            </div>
          </div>
        ) : (
          <>
            {old_data && renderDataGrid(old_data, "Datos Eliminados")}
            {new_data && renderDataGrid(new_data, "Datos Insertados")}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-2" />
          Panel de Administración
        </h2>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {error}
        </div>
      )}

      <div className="p-6">
        {/* Gestión de Usuarios */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Usuarios
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel de Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users
                  .filter(user => 
                    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.access_level || 'basic'}
                          onChange={(e) => handleUpdateAccessLevel(user.id, e.target.value as User['access_level'])}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="basic">Básico</option>
                          <option value="premium">Premium</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.is_admin
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {user.is_admin ? 'Sí' : 'No'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {user.is_admin ? 'Remover Admin' : 'Hacer Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registro de Actividad */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Registro de Actividad
          </h3>

          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {formatLogDetails(log.details)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}