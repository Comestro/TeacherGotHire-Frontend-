import { Link } from "react-router-dom"; // or from 'next/link' if using Next.js

const Footer = () => {
  return (
      <div className="text-center text-gray-500 mt-8 text-sm border-t py-4 px-4">
        <p>
          © 2024 PTPI Portal copyright ·
          <Link to="" className="hover:underline mx-2">
            Terms of Use
          </Link>{" "}
          ·
          <Link to="" className="hover:underline mx-2">
            Privacy Policy
          </Link>{" "}
          ·
          <Link to="" className="hover:underline mx-2">
            Accessibility
          </Link>{" "}
          ·
          
        </p>
      </div>
  );
};

export default Footer;