import {
  createElement,
  createContext,
  useCallback,
  useRef,
  useState,
  useContext,
  type ComponentType,
  type ComponentProps,
  type ReactNode,
  type MouseEvent as ReactMouseEvent
} from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useEvent } from "./use-event";

const ContextMenuContext = createContext<
  (clientX: number, clientY: number, content: ReactNode) => void
>(() => {});

export interface ContextMenuProviderProps {
  root?: ComponentType<ComponentProps<typeof ContextMenu.Root>>;
  trigger?: ComponentType<ComponentProps<typeof ContextMenu.Trigger>>;
  children?: ReactNode;
}

export function ContextMenuProvider({
  root: Root = ContextMenu.Root,
  trigger: Trigger = ContextMenu.Trigger,
  children
}: ContextMenuProviderProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<ReactNode>(null);

  const open = useCallback(
    (clientX: number, clientY: number, content: ReactNode) => {
      setContent(content);
      triggerRef.current?.dispatchEvent(
        new MouseEvent("contextmenu", { bubbles: true, clientX, clientY })
      );
    },
    []
  );

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
  factory: (x: number, y: number, event: ReactMouseEvent) => ReactNode
) {
  const open = useContext(ContextMenuContext);

  return useEvent((event: ReactMouseEvent) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const node = factory(x, y, event);
    open(clientX, clientY, node);
  });
}
