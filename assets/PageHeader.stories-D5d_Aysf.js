import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{F as i,I as a,i as o,n as s}from"./format-qU2wT2fq.js";import{n as c,t as l}from"./AntdIconLight-Be_nxVCr.js";import{a as u,n as d,r as f}from"./common-BX5x-0NG.js";import{n as p,t as m}from"./PlusOutlined-C2JyKQQJ.js";var h;function g(){return(g=t((()=>{h={icon:{tag:`svg`,attrs:{viewBox:`64 64 896 896`,focusable:`false`},children:[{tag:`path`,attrs:{d:`M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z`}}]},name:`download`,theme:`outlined`}})))()}function _(){return _=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},_.apply(this,arguments)}var v,y,b;function x(){return(x=t((()=>{v=e(n()),g(),c(),y=(e,t)=>v.createElement(l,_({},e,{ref:t,icon:h})),b=v.forwardRef(y)})))()}var S,C,w,T,E,D,O,k;function A(){return(A=t((()=>{S=n(),a(),x(),p(),u(),o(),C=r(),w={title:`Inputs/PageHeader & MonthSwitcher`,component:f,args:{title:`Transactions`,subtitle:`Everything you earned and spent`}},T={args:{subtitle:void 0}},E={},D={args:{extra:[(0,C.jsx)(i,{icon:(0,C.jsx)(b,{}),children:`Export`},`export`),(0,C.jsx)(i,{type:`primary`,icon:(0,C.jsx)(m,{}),children:`Add transaction`},`add`)]}},O={parameters:{controls:{disable:!0}},render:function(){let[e,t]=(0,S.useState)(s());return(0,C.jsx)(f,{title:`Dashboard`,subtitle:`Your month at a glance`,extra:(0,C.jsx)(d,{value:e,onChange:t})})}},k=[`TitleOnly`,`WithSubtitle`,`WithActions`,`MonthPicker`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    subtitle: undefined
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    extra: [<Button key="export" icon={<DownloadOutlined />}>Export</Button>, <Button key="add" type="primary" icon={<PlusOutlined />}>Add transaction</Button>]
  }
}`,...D.parameters?.docs?.source},description:{story:`Actions wrap under the title on narrow screens.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: function Render() {
    const [month, setMonth] = useState(currentMonth());
    return <PageHeader title="Dashboard" subtitle="Your month at a glance" extra={<MonthSwitcher value={month} onChange={setMonth} />} />;
  }
}`,...O.parameters?.docs?.source},description:{story:`Pick a month with the arrows or the picker. You can't go past the current month.`,...O.parameters?.docs?.description}}}})))()}A();export{O as MonthPicker,T as TitleOnly,D as WithActions,E as WithSubtitle,k as __namedExportsOrder,w as default};