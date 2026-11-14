/** Storybook setup: stories live next to their components in src/. */
const config = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
};

export default config;
