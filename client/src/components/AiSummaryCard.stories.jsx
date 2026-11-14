import AiSummaryCard from './AiSummaryCard';
import { delay, fail } from '../../.storybook/mockApi';

const SUMMARY =
  'You earned $5,200 and spent $3,100 in November, saving 40% of your income. Rent was your biggest cost at $1,400. ' +
  'Dining out is close to its $200 budget, and Entertainment went $45 over.';

export default {
  title: 'AI/AiSummaryCard',
  component: AiSummaryCard,
  args: { month: '2026-11' },
  decorators: [(Story) => <div style={{ maxWidth: 620 }}><Story /></div>],
};

/** The local model is running. Click the button to write a summary. */
export const Ready = {
  parameters: { api: { 'GET /ai/summary': () => delay(1500, { text: SUMMARY }) } },
};

/** The model can't be reached, so the card explains how to set it up. */
export const OllamaNotInstalled = {
  parameters: { api: { 'GET /ai/status': { available: false, reason: 'Ollama is not running on this computer.' } } },
};

/** Writing the summary fails, so the card shows the error and lets the user retry. */
export const SummaryFails = {
  parameters: { api: { 'GET /ai/summary': () => delay(800, fail(503, 'The AI model took too long to answer. Try again.')) } },
};
