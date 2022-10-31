
// interface BuilderObject {
//   props: (...any: any) => BuilderObject;
//   foregroundStyle: (...any: any) => BuilderObject;
//   build: () => React.ReactNode;
// }
// function Builder<T extends HTMLElement>(element: Parameters<typeof React.createElement>[0] = 'div', ...children: (BuilderObject | string)[]) {
//   let props: React.HTMLProps<T> | undefined;
//   return {
//     props(p: typeof props) {
//       props = p;
//       return this;
//     },
//     foregroundStyle(_style: 'primary' | 'secondary') {
//       const style = _style === 'primary' ? {
//         fontSize: '16px',
//         color: "#000",
//       } : {
//         fontSize: '10px',
//         color: "#DDD",
//       }
//       if (props === undefined) {
//         props = { style }
//       } else {
//         props.style = {
//           ...props.style,
//           ...style
//         }
//       }
//       return this;
//     },
//     build() {
//       return React.createElement(element, props, ...children.map(c => typeof c === 'string' ? c : c.build()))
//     }
//   }
// }