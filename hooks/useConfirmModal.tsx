"use client";
import { Download, Plus } from "lucide-react";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";

type ConfirmModalContextType = {
  showModal: (onConfirm: () => void, onCancel: () => void) => void;
};

const ConfirmModalContext = createContext<ConfirmModalContextType | undefined>(
  undefined
);

export const ConfirmModalProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [onCancel, setOnCancel] = useState<(() => void) | null>(null);

  const showModal = useCallback(
    (confirmCallback: () => void, cancelCallback: () => void) => {
      setOnConfirm(() => confirmCallback);
      setOnCancel(() => cancelCallback);
      setIsVisible(true);
    },
    []
  );

  const hideModal = useCallback(() => {
    setIsVisible(false);
    setOnConfirm(null);
    setOnCancel(null);
  }, []);

  return (
    <ConfirmModalContext.Provider value={{ showModal }}>
      {children}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <p className="text-lg font-medium text-gray-800 mb-4">
              Would you like to confirm delete?
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onCancel?.();
                  hideModal();
                }}
              >
                Cancel
              </Button>

              <Button
                size="lg"
                onClick={() => {
                  onConfirm?.();
                  hideModal();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  );
};

export const useConfirmModal = (): ConfirmModalContextType => {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error(
      "useConfirmModal must be used within a ConfirmModalProvider"
    );
  }
  return context;
};
