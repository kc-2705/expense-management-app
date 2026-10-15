import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { App as AntApp, ConfigProvider, theme as antTheme } from 'antd';

const ThemeContext = createContext(null);
const KEY = 'expenso.theme';

function initialMode() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage blocked: fall back to the system setting.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Brand colors shared by Ant Design components and our own CSS.
export const BRAND = { primary: '#0f766e', income: '#16a34a', expense: '#e11d48', warning: '#d97706' };

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      // Not critical.
    }
  }, [mode]);

  const value = useMemo(() => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: BRAND.primary,
            colorLink: mode === 'dark' ? '#2dd4bf' : BRAND.primary,
            colorSuccess: BRAND.income,
            colorError: BRAND.expense,
            colorWarning: BRAND.warning,
            fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
            borderRadius: 10,
            colorBgLayout: mode === 'dark' ? '#0b1312' : '#f4f7f6',
          },
          components: {
            Layout: { siderBg: mode === 'dark' ? '#0f1b1a' : '#ffffff', headerBg: 'transparent' },
            Menu: {
              itemBorderRadius: 8,
              itemMarginInline: 8,
              itemSelectedBg: mode === 'dark' ? '#134e4a' : '#ccfbf1',
              itemSelectedColor: mode === 'dark' ? '#5eead4' : '#0f766e',
            },
            Card: { paddingLG: 20 },
          },
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
