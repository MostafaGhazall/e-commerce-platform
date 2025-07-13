import { Component, ReactNode } from "react";
import toast from "react-hot-toast";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasErr: boolean }> {
  state = { hasErr: false };

  static getDerivedStateFromError() {
    return { hasErr: true };
  }

  componentDidCatch(err: unknown) {
    console.error(err);
    toast.error("Something went wrong");
  }

  render() {
    return this.state.hasErr ? (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Oops!</h1>
        <p>We hit an unexpected error. Please refresh.</p>
      </div>
    ) : (
      this.props.children
    );
  }
}
