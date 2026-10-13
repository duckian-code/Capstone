import { useEffect } from "react";

export interface Toast {
    id: number;
    message: string;
}

interface ErrorToastProps {
    toast: Toast | null;
    onDismiss: () => void;
}

export function ErrorToast({toast, onDismiss}: ErrorToastProps) {
    useEffect(() => {
        if (!toast) return;

        // const timer = window.setTimeout(onDismiss, 5000);

        return () => {
            // window.clearTimeout(timer);
        }
    }, [toast, onDismiss])

    if (!toast) return null;

    return (
      <div className="error-toast" role="alert">
          <span>{toast.message}</span>
          <button onClick={onDismiss} aria-label="Dismiss">x</button>
      </div>
    );
}