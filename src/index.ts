import {
  createElement,
  createContext,
  useCallback,
  useRef,
  useState,
  useContext,
  useEffectEvent,
  type ReactNode,
  type MouseEvent as ReactMouseEvent
} from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";

const ContextMenuContext = createContext<
  (x: number, y: number, content: ReactNode) => void
>(() => {});

export interface ContextMenuProviderProps {
  root?: typeof ContextMenu.Root;
  trigger?: typeof ContextMenu.Trigger;
  children?: ReactNode;
}

export function ContextMenuProvider({
  root: Root = ContextMenu.Root,
  trigger: Trigger = ContextMenu.Trigger,
  children
}: ContextMenuProviderProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<ReactNode>(null);

  const open = useCallback((x: number, y: number, content: ReactNode) => {
    setContent(content);
    triggerRef.current?.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: x,
        clientY: y
      })
    );
  }, []);

  return createElement(
    ContextMenuContext.Provider,
    { value: open },
    createElement(
      Root,
      { onOpenChange: open => !open && setContent(null) },
      createElement(
        Trigger,
        { asChild: true, ref: triggerRef },
        createElement("div", { style: { display: "none" } })
      ),
      content
    ),
    children
  );
}

export function useContextMenu(
  node:
    | ReactNode
    | ((x: number, y: number, event: ReactMouseEvent) => ReactNode)
) {
  const open = useContext(ContextMenuContext);
  const getNode = useEffectEvent(() => node);

  return useCallback((event: ReactMouseEvent) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    let node = getNode();
    if (typeof node === "function") {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      node = node(x, y, event);
    }
    open(clientX, clientY, node);
  }, []);
}
