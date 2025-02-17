import React, { useState, useEffect } from 'react';
import { ExerciseForm } from './components/ExerciseForm';
import { WorkoutHistory } from './components/WorkoutHistory';
import { WorkoutStats } from './components/WorkoutStats';
import { MuscleGuide } from './components/MuscleGuide';
import { AuthForm } from './components/AuthForm';
import { UserProfile } from './components/UserProfile';
import { ProgressTracker } from './components/ProgressTracker';
import { Achievements } from './components/Achievements';
import { Dashboard } from './components/Dashboard';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { GoalsManager } from './components/GoalsManager';
import { ExerciseManager } from './components/ExerciseManager';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { 
  Dumbbell, 
  History, 
  LineChart, 
  Menu, 
  X,
  BookOpen,
  LogOut,
  User,
  Camera,
  Trophy,
  Home,
  Calendar,
  Target,
  Settings,
  Shield
} from 'lucide-react';
import type { Exercise, MuscleGroup } from './types';

type TabType = 'home' | 'guide' | 'form' | 'history' | 'stats' | 'profile' | 'progress' | 'achievements' | 'planner' | 'goals' | 'admin' | 'exercise-manager';

function App() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(supabase.auth.getSession());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error al verificar estado de admin:', error);
      setIsAdmin(false);
    }
  };

  const handleExerciseSubmit = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID()
    };
    setExercises(prev => [...prev, newExercise]);
    alert('¡Ejercicio registrado con éxito!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavigate = (tab: TabType, muscleGroup?: MuscleGroup) => {
    setActiveTab(tab);
    if (muscleGroup) {
      setSelectedMuscleGroup(muscleGroup);
    }
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'guide', icon: BookOpen, label: 'Guía de Ejercicios' },
    { id: 'planner', icon: Calendar, label: 'Planificador' },
    { id: 'form', icon: Dumbbell, label: 'Registrar Ejercicio' },
    { id: 'history', icon: History, label: 'Mi Historial' },
    { id: 'stats', icon: LineChart, label: 'Estadísticas' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'profile', icon: User, label: 'Mi Perfil' },
    { id: 'progress', icon: Camera, label: 'Progreso' },
    { id: 'achievements', icon: Trophy, label: 'Logros' }
  ];

  if (isAdmin) {
    menuItems.push(
      { id: 'exercise-manager', icon: Settings, label: 'Gestionar Ejercicios' },
      { id: 'admin', icon: Shield, label: 'Panel de Admin' }
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Menú lateral */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg transform transition-transform duration-200
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Dumbbell className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">Mi Rutina Fitness</h1>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleNavigate(id as TabType)}
              className={`
                w-full text-left px-4 py-2 rounded-lg flex items-center justify-between
                transition-colors duration-200
                ${activeTab === id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <span>{label}</span>
              <Icon className={`w-5 h-5 ${
                activeTab === id ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 md:p-8">
        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Contenido dinámico */}
        {activeTab === 'home' && <Dashboard onNavigate={handleNavigate} />}
        {activeTab === 'guide' && <MuscleGuide initialMuscleGroup={selectedMuscleGroup} />}
        {activeTab === 'planner' && <WorkoutPlanner />}
        {activeTab === 'form' && <ExerciseForm onSubmit={handleExerciseSubmit} />}
        {activeTab === 'history' && <WorkoutHistory exercises={exercises} />}
        {activeTab === 'stats' && <WorkoutStats exercises={exercises} onNavigate={handleNavigate} />}
        {activeTab === 'goals' && <GoalsManager />}
        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'progress' && <ProgressTracker />}
        {activeTab === 'achievements' && <Achievements />}
        {activeTab === 'exercise-manager' && isAdmin && <ExerciseManager />}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>
    </div>
  );
}

export default App;