import "./App.css";
import React from "react";

interface Album {
  title: string;
  cover: string;
  songs: Song[];
  artist: {
    name: string;
  };
}
interface Song {
  title: string;
  duration: string;
}
const ALBUM: Album = {
  title: "Acid Angle from Asia <ACCESS>",
  cover: "https://i.scdn.co/image/ab67616d00001e021be910fd8122cd805d651a8d",
  artist: {
    name: "tripleS",
  },
  songs: [
    {
      title: "Access (Intro)",
      duration: "0:45",
    },
    {
      title: "Generation",
      duration: "2:44",
    },
    {
      title: "Rolex",
      duration: "3:12",
    },
  ],
};

export default function App() {
  const [tapped, setTapped] = React.useState(-1);

  return View(
    List(ALBUM.songs, (song, i) =>
      HStack(
        Image(ALBUM.cover).alt("Cover art for " + ALBUM.title),
        VStack(
          { alignment: "leading" },
          Text(song.title),
          Text(ALBUM.artist.name).foregroundStyle("secondary")
        )
      )
        .onPointerDown(() => setTapped(i))
        .onPointerUp(() => setTapped(-1))
        .style({
          backgroundColor: tapped === i ? "#DDD" : "",
        })
    )
  )
    .style({
      fontFamily: "system-ui",
    })
    .className("p-2")(); // Call the topmost builder to render out ReactElements
}

function View(...children: BuilderFunction[]) {
  return ProxyBuilder("div", undefined, ...children);
}

function List<T>(
  items: T[],
  iterator: (item: T, index: number) => BuilderFunction
) {
  return ProxyBuilder("ul", undefined, ...items.map(iterator));
}

interface HStackProps {
  alignment: "top" | "center" | "bottom";
  spacing: number;
}
function HStack(
  propsOrFirstItem: HStackProps | BuilderFunction,
  ...children: BuilderFunction[]
) {
  const hasProps = typeof propsOrFirstItem !== "function";
  const props = hasProps ? (propsOrFirstItem as HStackProps) : undefined;
  const allChildren = hasProps
    ? children
    : ([propsOrFirstItem, ...children] as BuilderFunction[]);
  return ProxyBuilder("div", undefined, ...allChildren).style({
    display: "flex",
    flex: "1",
    ...(props && {
      justifyItems:
        props.alignment === "top"
          ? "start"
          : props.alignment === "bottom"
          ? "end"
          : "center",
    }),
    gap: props?.spacing !== undefined ? props.spacing + "px" : "10px",
  });
}

interface VStackProps {
  alignment?: "leading" | "center" | "trailing";
  spacing?: number;
}
function VStack(propsOrFirstItem: VStackProps, ...children: BuilderFunction[]) {
  const hasProps = typeof propsOrFirstItem !== "function";
  const props = hasProps ? (propsOrFirstItem as VStackProps) : undefined;
  const allChildren = hasProps
    ? children
    : ([propsOrFirstItem, ...children] as BuilderFunction[]);
  return ProxyBuilder("div", undefined, ...allChildren).style({
    display: "flex",
    flex: "1",
    flexDirection: "column",
    ...(props?.alignment && {
      justifyItems:
        props.alignment === "leading"
          ? "start"
          : props.alignment === "trailing"
          ? "end"
          : "center",
    }),
    gap: props?.spacing !== undefined ? props.spacing + "px" : "10px",
  });
}

function Image(src: string) {
  return ProxyBuilder("img").src(src);
}

function Text(text: string) {
  return ProxyBuilder("span", undefined, text);
}

const swiftMethods = {
  foregroundStyle(_style: "primary" | "secondary") {
    const style =
      _style === "secondary"
        ? {
            fontSize: ".8rem",
            color: "#AAA",
          }
        : {
            fontSize: "1rem",
            color: "#000",
          };
    return {
      style,
    };
  },
  padding(v?: number | string) {
    return {
      style: {
        padding: v ?? 10,
      },
    };
  },
  cornerRadius(v?: number) {
    return {
      style: {
        borderRadius: v ?? 10,
      },
    };
  },
};

type BuilderFunction = () => React.ReactElement;

type ProxyBuilderType<T extends keyof JSX.IntrinsicElements> = {
  [Property in keyof React.ComponentProps<T>]-?: (
    arg:
      | React.ComponentProps<T>[Property]
      | Partial<React.ComponentProps<T>[Property]>
  ) => ProxyBuilderType<T>;
} & {
  [Property in keyof typeof swiftMethods]: (
    arg?: Partial<typeof swiftMethods[Property]>
  ) => ProxyBuilderType<T>;
} & BuilderFunction;

const ProxyBuilder = <T extends keyof JSX.IntrinsicElements>(
  element: T,
  props?: React.ComponentProps<T>,
  ...children: (BuilderFunction | string)[]
): ProxyBuilderType<T> => {
  const _props = props ? { ...props } : ({} as any); // Shush TS
  return new Proxy<ProxyBuilderType<T>>((() => {}) as ProxyBuilderType<T>, {
    get(_, prop) {
      // Special SwiftMethods we're providing
      if (swiftMethods.hasOwnProperty(prop)) {
        return (...args: any) => {
          const newProps = (swiftMethods as Record<any, any>)[
            prop as keyof typeof swiftMethods
          ](...args);
          for (let key in newProps) {
            _props[key] = {
              ..._props[key],
              ...newProps[key],
            };
          }
          return ProxyBuilder(element, _props, ...children);
        };
      }

      // All regular React props are now chainable functions
      const key = prop as keyof React.HTMLProps<T>;
      return (value: any) => {
        _props[key] =
          typeof _props[key] === "object"
            ? { ..._props[key], ...value }
            : value;
        return ProxyBuilder(element, _props, ...children);
      };
    },
    apply() {
      return React.createElement(
        element,
        _props,
        ...children.map((c) => (typeof c === "string" ? c : c()))
      );
    },
  });
};
