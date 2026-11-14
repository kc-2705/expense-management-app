import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{n as i,t as a}from"./AntdIconLight-Be_nxVCr.js";import{a as o,c as s,d as c,i as l,l as u,u as d}from"./common-BX5x-0NG.js";var f;function p(){return(p=t((()=>{f={icon:{tag:`svg`,attrs:{viewBox:`64 64 896 896`,focusable:`false`},children:[{tag:`path`,attrs:{d:`M855.7 210.8l-42.4-42.4a8.03 8.03 0 00-11.3 0L168.3 801.9a8.03 8.03 0 000 11.3l42.4 42.4c3.1 3.1 8.2 3.1 11.3 0L855.6 222c3.2-3 3.2-8.1.1-11.2zM304 448c79.4 0 144-64.6 144-144s-64.6-144-144-144-144 64.6-144 144 64.6 144 144 144zm0-216c39.7 0 72 32.3 72 72s-32.3 72-72 72-72-32.3-72-72 32.3-72 72-72zm416 344c-79.4 0-144 64.6-144 144s64.6 144 144 144 144-64.6 144-144-64.6-144-144-144zm0 216c-39.7 0-72-32.3-72-72s32.3-72 72-72 72 32.3 72 72-32.3 72-72 72z`}}]},name:`percentage`,theme:`outlined`}})))()}function m(){return m=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},m.apply(this,arguments)}var h,g,_;function v(){return(v=t((()=>{h=e(n()),p(),i(),g=(e,t)=>h.createElement(a,m({},e,{ref:t,icon:f})),_=h.forwardRef(g)})))()}var y;function b(){return(b=t((()=>{y={icon:{tag:`svg`,attrs:{viewBox:`64 64 896 896`,focusable:`false`},children:[{tag:`path`,attrs:{d:`M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 464H528V448h312v128zm0 264H184V184h656v200H496c-17.7 0-32 14.3-32 32v192c0 17.7 14.3 32 32 32h344v200zM580 512a40 40 0 1080 0 40 40 0 10-80 0z`}}]},name:`wallet`,theme:`outlined`}})))()}function x(){return x=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},x.apply(this,arguments)}var S,C,w;function T(){return(T=t((()=>{S=e(n()),b(),i(),C=(e,t)=>S.createElement(a,x({},e,{ref:t,icon:y})),w=S.forwardRef(C)})))()}var E,D,O,k,A,j,M,N,P;function F(){return(F=t((()=>{c(),u(),v(),T(),o(),E=r(),D={title:`Data display/StatCard`,component:l,argTypes:{tone:{control:`select`,options:[`neutral`,`income`,`expense`,`primary`]},goodWhen:{control:`inline-radio`,options:[`up`,`down`]},icon:{control:!1}},decorators:[(e,{parameters:t})=>(0,E.jsx)(`div`,{style:{maxWidth:t.wide?`none`:280},children:(0,E.jsx)(e,{})})]},O={args:{label:`Income`,value:5200,previous:4800,tone:`income`,icon:(0,E.jsx)(d,{})}},k={args:{label:`Expenses`,value:3100,previous:2600,tone:`expense`,goodWhen:`down`,icon:(0,E.jsx)(s,{})}},A={args:{label:`Expenses`,value:2300,previous:2600,tone:`expense`,goodWhen:`down`,icon:(0,E.jsx)(s,{})}},j={args:{label:`Balance`,value:2100,tone:`primary`,icon:(0,E.jsx)(w,{})}},M={args:{label:`Savings rate`,value:40,previous:32,suffix:`%`,icon:(0,E.jsx)(_,{})}},N={parameters:{wide:!0,controls:{disable:!0}},render:()=>(0,E.jsxs)(`div`,{className:`stat-grid`,style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(200px, 1fr))`,gap:16},children:[(0,E.jsx)(l,{...O.args}),(0,E.jsx)(l,{...k.args}),(0,E.jsx)(l,{...j.args,previous:2e3}),(0,E.jsx)(l,{...M.args})]})},P=[`IncomeUp`,`ExpensesUp`,`ExpensesDown`,`NoLastMonth`,`Percentage`,`DashboardRow`],O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Income',
    value: 5200,
    previous: 4800,
    tone: 'income',
    icon: <ArrowDownOutlined />
  }
}`,...O.parameters?.docs?.source},description:{story:`Income went up, which is good, so the change is green.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Expenses',
    value: 3100,
    previous: 2600,
    tone: 'expense',
    goodWhen: 'down',
    icon: <ArrowUpOutlined />
  }
}`,...k.parameters?.docs?.source},description:{story:`Expenses went up, which is bad, so the change is red.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Expenses',
    value: 2300,
    previous: 2600,
    tone: 'expense',
    goodWhen: 'down',
    icon: <ArrowUpOutlined />
  }
}`,...A.parameters?.docs?.source},description:{story:`Expenses went down, which is good.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Balance',
    value: 2100,
    tone: 'primary',
    icon: <WalletOutlined />
  }
}`,...j.parameters?.docs?.source},description:{story:`A new user has nothing to compare against yet.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Savings rate',
    value: 40,
    previous: 32,
    suffix: '%',
    icon: <PercentageOutlined />
  }
}`,...M.parameters?.docs?.source},description:{story:`Percentages use a suffix instead of currency formatting.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  parameters: {
    wide: true,
    controls: {
      disable: true
    }
  },
  render: () => <div className="stat-grid" style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16
  }}>\r
      <StatCard {...IncomeUp.args} />\r
      <StatCard {...ExpensesUp.args} />\r
      <StatCard {...NoLastMonth.args} previous={2000} />\r
      <StatCard {...Percentage.args} />\r
    </div>
}`,...N.parameters?.docs?.source},description:{story:`The four cards as they sit on the dashboard.`,...N.parameters?.docs?.description}}}})))()}F();export{N as DashboardRow,A as ExpensesDown,k as ExpensesUp,O as IncomeUp,j as NoLastMonth,M as Percentage,P as __namedExportsOrder,D as default};