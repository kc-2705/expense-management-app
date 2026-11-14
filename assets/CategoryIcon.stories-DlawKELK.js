import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-MKhVqBIO.js";import{i as n,n as r,r as i,t as a}from"./CategoryIcon-CQZ50MPg.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),o=t(),s={title:`Data display/CategoryIcon`,component:r,argTypes:{icon:{control:`select`,options:Object.keys(i)},color:{control:`color`},size:{control:{type:`range`,min:20,max:80,step:2}}},args:{icon:`shopping-cart`,color:`#22c55e`,size:34}},c={},l={args:{icon:`home`,color:`#6366f1`,size:64}},u={args:{icon:`does-not-exist`,color:`#64748b`}},d={parameters:{controls:{disable:!0}},render:()=>(0,o.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fill, minmax(96px, 1fr))`,gap:16},children:Object.keys(i).map((e,t)=>(0,o.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`,gap:6,fontSize:12},children:[(0,o.jsx)(r,{icon:e,color:a[t%a.length],size:40}),(0,o.jsx)(`code`,{children:e})]},e))})},f=[`Default`,`Large`,`UnknownIcon`,`AllIcons`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'home',
    color: '#6366f1',
    size: 64
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'does-not-exist',
    color: '#64748b'
  }
}`,...u.parameters?.docs?.source},description:{story:`Unknown icon names fall back to a tag icon instead of breaking.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    gap: 16
  }}>\r
      {Object.keys(ICONS).map((name, i) => <div key={name} style={{
      display: 'grid',
      justifyItems: 'center',
      gap: 6,
      fontSize: 12
    }}>\r
          <CategoryIcon icon={name} color={COLOR_PRESETS[i % COLOR_PRESETS.length]} size={40} />\r
          <code>{name}</code>\r
        </div>)}\r
    </div>
}`,...d.parameters?.docs?.source},description:{story:`Every icon a user can pick for a category, in the preset colors.`,...d.parameters?.docs?.description}}}})))()}p();export{d as AllIcons,c as Default,l as Large,u as UnknownIcon,f as __namedExportsOrder,s as default};