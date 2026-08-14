import { Outlet, RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MyTicketsPage from './pages/MyTicketsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSetupPage from './pages/AdminSetupPage';
import api from './api/axios';

const homeLoader = async ({ request }) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const query = params.toString() ? `?${params.toString()}` : '';
  const { data } = await api.get(`/events${query}`);
  return data;
};

const eventLoader = async ({ params }) => {
  const { data } = await api.get(`/events/${params.id}`);
  return data;
};

const dashboardLoader = async () => {
  const { data } = await api.get('/tickets/my');
  return data;
};

const adminLoader = async () => {
  const { data } = await api.get('/events/dashboard');
  return data;
};

const loginAction = async ({ request }) => {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());

  try {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('event-ticketing-auth-user', JSON.stringify(data.user));
    window.dispatchEvent(new CustomEvent('auth:user', { detail: data.user }));
    return redirect(data.user?.role === 'admin' ? '/admin' : '/dashboard');
  } catch (error) {
    return { error: error.response?.data?.message || 'Login failed' };
  }
};

const registerAction = async ({ request }) => {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());

  try {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('event-ticketing-auth-user', JSON.stringify(data.user));
    window.dispatchEvent(new CustomEvent('auth:user', { detail: data.user }));
    return redirect(data.user?.role === 'admin' ? '/admin' : '/dashboard');
  } catch (error) {
    return { error: error.response?.data?.message || 'Registration failed' };
  }
};

const AppLayout = () => (
  <div className="min-h-screen bg-softGray text-slateText">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', loader: homeLoader, Component: HomePage },
      { path: '/events', loader: homeLoader, Component: HomePage },
      { path: '/events/:id', loader: eventLoader, Component: EventDetailsPage },
      { path: '/login', Component: LoginPage, action: loginAction },
      { path: '/register', Component: RegisterPage, action: registerAction },
      {
        path: '/dashboard',
        loader: dashboardLoader,
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: '/my-tickets',
        loader: dashboardLoader,
        element: <ProtectedRoute><MyTicketsPage /></ProtectedRoute>,
      },
      {
        path: '/admin',
        loader: adminLoader,
        element: <ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>,
      },
      { path: '/admin/setup', Component: AdminSetupPage },
      {
        path: '*',
        element: (
          <div className="rounded-3xl bg-white p-12 text-center text-2xl font-semibold text-slate-700 shadow-soft">
            404 - Page not found
          </div>
        ),
      },
    ],
  },
]);

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

export default App;
