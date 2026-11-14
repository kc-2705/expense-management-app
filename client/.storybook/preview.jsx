import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { api } from '../src/api/client';
import { DEFAULT_ROUTES, mockAdapter } from './mockApi';
import '../src/styles.css';

/** Wraps every story in the same providers the app uses, with a mocked API. */
function AppProviders({ theme, routes, children }) {
  api.defaults.adapter = mockAdapter({ ...DEFAULT_ROUTES, ...routes });
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } }),
  );
  try {
    localStorage.setItem('expenso.theme', theme);
  } catch {
    // Storage blocked: the theme falls back to the system setting.
  }
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ThemeProvider key={theme}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const preview = {
  globalTypes: {
    theme: {
      description: 'Light or dark theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals, parameters }) => (
      <AppProviders theme={globals.theme} routes={parameters.api}>
        <Story />
      </AppProviders>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: 'error' },
    options: { storySort: { order: ['Introduction', 'Foundations', 'Data display', 'Charts', 'Inputs', 'Forms', 'AI'] } },
  },
  tags: ['autodocs'],
};

export default preview;
