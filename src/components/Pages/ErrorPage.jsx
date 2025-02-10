import { Link } from "react-router-dom";

const Error404 = () => {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 max-w-lg mx-auto">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-all duration-200"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error404;
