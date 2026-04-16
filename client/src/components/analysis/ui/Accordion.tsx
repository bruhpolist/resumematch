import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

export const Accordion = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}: {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(
    defaultOpen ? [defaultOpen] : []
  );

  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      }
      return prev.includes(id) ? [] : [id];
    });
  };

  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider
      value={{ activeItems, toggleItem, isItemActive }}
    >
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`overflow-hidden border-b border-gray-200 ${className}`}>{children}</div>;
};

export const AccordionHeader = ({
  itemId,
  children,
  className = "",
}: {
  itemId: string;
  children: ReactNode;
  className?: string;
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  return (
    <button
      onClick={() => toggleItem(itemId)}
      className={`w-full px-4 py-3 text-left transition-colors duration-200 flex items-center justify-between ${className}`}
    >
      <div className="flex-1">{children}</div>
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
        fill="none"
        stroke="#98A2B3"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

export const AccordionContent = ({
  itemId,
  children,
  className = "",
}: {
  itemId: string;
  children: ReactNode;
  className?: string;
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isActive ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      } ${className}`}
    >
      <div className="px-4 py-3">{children}</div>
    </div>
  );
};

