import { Component } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "./Button";
export class ErrorBoundary extends Component {
  state = {
    hasError: false
  };
  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }
  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <AlertOctagon className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            An unexpected error occurred while rendering this page. Try reloading.
          </p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>;
    }
    return this.props.children;
  }
}