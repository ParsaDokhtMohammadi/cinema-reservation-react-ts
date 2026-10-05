import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router';

import { ThemeProvider } from './context/ThemeProvider';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { PageLoading } from './components/ui/States';

// Route-level code splitting — the booking page in particular pulls in the
// seat map and SweetAlert2, which the landing page does not need.
const HomePage = lazy(() => import('./pages/HomePage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const MovieDetailsPage = lazy(() => import('./pages/MovieDetailsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Every navigation starts at the top of the new page. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

/** `/showtimes/:movieId` is kept as an alias for the film's showtimes. */
function ShowtimesRedirect() {
  const { movieId } = useParams<{ movieId: string }>();
  return <Navigate to={`/movies/${movieId ?? ''}`} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/*
        Opacity only, deliberately: a transform here would become the
        containing block for every `position: fixed` child, which would break
        the booking page's sticky mobile bar and its summary sheet.
      */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageLoading />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
            <Route path="/showtimes/:movieId" element={<ShowtimesRedirect />} />
            <Route path="/booking/:showtimeId" element={<BookingPage />} />
            <Route path="/reservation/:reservationId" element={<ConfirmationPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

/** Toasts inherit the theme through CSS custom properties. */
function ThemedToaster() {
  return (
    <Toaster
      position="top-center"
      containerClassName="print-hide"
      containerStyle={{ top: 76 }}
      toastOptions={{
        duration: 2400,
        style: {
          background: 'var(--surface-raised)',
          color: 'var(--text-primary)',
          border: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-ambient)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: '0.625rem 0.875rem',
          maxWidth: '22rem',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
        error: { duration: 3600, iconTheme: { primary: '#d83a2e', secondary: '#ffffff' } },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <AnimatedRoutes />
          </Layout>
          <ThemedToaster />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
