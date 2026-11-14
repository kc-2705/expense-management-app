import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{i as n,r}from"./react-DITjJg24.js";import{l as i,s as a}from"./blocks-4OFfN0hk.js";function o(e){let t={code:`code`,h1:`h1`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...n(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(a,{title:`Introduction`}),`
`,(0,c.jsx)(t.h1,{id:`expenso-ui-components`,children:`Expenso UI components`}),`
`,(0,c.jsxs)(t.p,{children:[`These are the building blocks of `,(0,c.jsx)(t.strong,{children:`Expenso`}),`, a personal finance tracker built with React, Ant Design, React Query and Recharts.
Each component is shown on its own, in every state it can be in: normal, empty, loading, error, light and dark.`]}),`
`,(0,c.jsx)(t.h2,{id:`how-to-use-this-storybook`,children:`How to use this Storybook`}),`
`,(0,c.jsxs)(t.ul,{children:[`
`,(0,c.jsx)(t.li,{children:`Pick a component in the sidebar. Each story is one state of it.`}),`
`,(0,c.jsxs)(t.li,{children:[`Change props live in the `,(0,c.jsx)(t.strong,{children:`Controls`}),` panel.`]}),`
`,(0,c.jsxs)(t.li,{children:[`Switch between `,(0,c.jsx)(t.strong,{children:`light and dark`}),` with the Theme button in the toolbar.`]}),`
`,(0,c.jsxs)(t.li,{children:[`Check phone and tablet sizes with the `,(0,c.jsx)(t.strong,{children:`Viewport`}),` button.`]}),`
`,(0,c.jsxs)(t.li,{children:[`Open the `,(0,c.jsx)(t.strong,{children:`Accessibility`}),` panel to see automatic WCAG checks (axe-core).`]}),`
`]}),`
`,(0,c.jsx)(t.h2,{id:`no-server-needed`,children:`No server needed`}),`
`,(0,c.jsxs)(t.p,{children:[`Stories that load data use a small mock API (`,(0,c.jsx)(t.code,{children:`.storybook/mockApi.js`}),`). Each story says what the server should answer,
so states like "the AI model is offline" or "saving failed" are easy to show:`]}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-js`,children:`export const OllamaNotInstalled = {
  parameters: { api: { 'GET /ai/status': { available: false, reason: 'Ollama is not running.' } } },
};
`})}),`
`,(0,c.jsx)(t.h2,{id:`sections`,children:`Sections`}),`
`,(0,c.jsx)(t.p,{children:`| Section | What's in it |
| --- | --- |
| Foundations | Brand colors and typography |
| Data display | Category icons, amounts, stat cards, budget bars |
| Charts | Six-month trend and spending by category |
| Inputs | Page header and month switcher |
| Forms | Add and edit transaction dialog with validation |
| AI | The monthly summary card, written by a local model |`})]})}function s(e={}){let{wrapper:t}={...n(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;function l(){return(l=e((()=>{c=t(),r(),i()})))()}l();export{s as default};