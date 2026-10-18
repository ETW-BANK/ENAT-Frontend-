import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-4xl font-bold text-brand-700">404</h1>
      <p className="mt-2 text-slate-600">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Go Home</Link>
    </div>
  );
}