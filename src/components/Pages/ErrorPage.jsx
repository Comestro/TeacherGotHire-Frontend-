import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden flex flex-col md:flex-row items-stretch">
        <div className="md:w-full p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-teal-50 text-teal-600 w-14 h-14 flex items-center justify-center text-2xl font-bold">404</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Page not found</h1>
              <p className="text-sm text-gray-500 mt-1">We couldn't find the page you're looking for.</p>
            </div>
          </div>

          <p className="mt-6 text-gray-600">It might have been removed, had its name changed, or is temporarily unavailable. Try one of the options below.</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition">
              Go back home
            </Link>

            <a href="mailto:support@example.com" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
              Contact support
            </a>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Error404;
