import { AxiosError } from 'axios';

/**
 * A fake backend for Storybook. Stories describe the responses they need:
 *
 *   parameters: { api: { 'GET /ai/status': { available: true } } }
 *
 * A value is returned as the response body. A function receives the request
 * config and can return a body, wait with delay(), or fail with fail().
 */

export const delay = (ms, body) => new Promise((resolve) => setTimeout(() => resolve(body), ms));

export function fail(status, message) {
  return { __fail: { status, message } };
}

export const CATEGORIES = [
  { _id: 'c1', type: 'expense', name: 'Groceries', color: '#22c55e', icon: 'shopping-cart' },
  { _id: 'c2', type: 'expense', name: 'Rent', color: '#6366f1', icon: 'home' },
  { _id: 'c3', type: 'expense', name: 'Dining out', color: '#f97316', icon: 'coffee' },
  { _id: 'c4', type: 'expense', name: 'Transport', color: '#0ea5e9', icon: 'car' },
  { _id: 'c5', type: 'expense', name: 'Utilities', color: '#eab308', icon: 'thunderbolt' },
  { _id: 'c6', type: 'expense', name: 'Entertainment', color: '#ec4899', icon: 'play-circle' },
  { _id: 'c7', type: 'income', name: 'Salary', color: '#16a34a', icon: 'bank' },
  { _id: 'c8', type: 'income', name: 'Freelance', color: '#14b8a6', icon: 'laptop' },
];

/** Responses every story gets unless it overrides them. */
export const DEFAULT_ROUTES = {
  'GET /categories': CATEGORIES,
  'GET /ai/status': { available: true, model: 'llama3.2:3b' },
};

export function mockAdapter(routes) {
  return async (config) => {
    const key = `${(config.method ?? 'get').toUpperCase()} ${config.url}`;
    const response = (status, data) => ({ data, status, statusText: String(status), headers: {}, config, request: {} });
    const reject = (status, message) => {
      throw new AxiosError(message, String(status), config, {}, response(status, { message }));
    };

    if (!(key in routes)) reject(404, `Storybook has no mock for ${key}`);
    const handler = routes[key];
    const body = typeof handler === 'function' ? await handler(config) : handler;
    if (body?.__fail) reject(body.__fail.status, body.__fail.message);
    return response(200, body);
  };
}
