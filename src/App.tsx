import "./App.css";
import React, { CSSProperties } from "react";

export default function App() {
  return View("Hello world").padding(10)();
}

function View(...children: BuilderChild[]) {
  return ProxyBuilder(InnerView, undefined, ...children);
}

const asComponent =
  <T extends keyof JSX.IntrinsicElements>(type: T) =>
  ({ children, ...props }: React.ComponentProps<T>) =>
    React.createElement(type, props, ...React.Children.toArray(children));

const withSwiftStyleProps =
  <T extends React.ComponentType<{ style?: CSSProperties }>>(Component: T) =>
  ({
    cornerRadius,
    foregroundStyle,
    padding,
    style = {},
    ...props
  }: React.ComponentProps<T> & {
    cornerRadius?: number | string;
    foregroundStyle?: "primary" | "secondary";
    padding?: number | string;
  }) => {
    return (
      <Component
        style={{
          borderRadius: cornerRadius,
          ...(foregroundStyle === "secondary"
            ? {
                fontSize: ".8rem",
                color: "#AAA",
              }
            : {
                fontSize: "1rem",
                color: "#000",
              }),
          padding,
          ...style,
        }}
        {...(props as any)}
      />
    );
  };

const InnerView = withSwiftStyleProps(asComponent("div"));

type BuilderChild = React.FunctionComponent | React.ReactNode;

type ProxyBuilderType<T extends React.ElementType> = {
  [K in keyof React.ComponentProps<T>]-?: (
    arg: React.ComponentProps<T>[K]
  ) => ProxyBuilderType<T>;
} & { (props?: React.ComponentProps<T>): React.ReactElement | null };

const ProxyBuilder = <
  T extends keyof JSX.IntrinsicElements | React.ComponentType
>(
  element: T,
  props = {} as React.ComponentProps<T>,
  ...children: BuilderChild[]
) => {
  return new Proxy(() => {}, {
    get(_, key) {
      // All regular React props are now chainable functions
      return (value: any) => {
        return ProxyBuilder(element, { ...props, [key]: value }, ...children);
      };
    },
    apply(
      _,
      __,
      [{ children: passedChildren = undefined, ...passedProps } = {}] = []
    ) {
      return React.createElement(
        element,
        { ...props, ...passedProps },
        ...children.map((c) => (typeof c === "function" ? c({}) : c)),
        ...React.Children.toArray(passedChildren)
      );
    },
  }) as unknown as ProxyBuilderType<T>;
};
