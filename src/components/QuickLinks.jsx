
import React from "react";

const QuickLinks = ({ scrollToSection }) => {
  const links = [
    { name: "Resume", action: "Update", id: "resume" },
    { name: "Key skills", action: "", id: "skills" },
    { name: "Education", action: "Add", id: "education" },
    { name: "Projects", action: "", id: "projects" },
    { name: "Personal details", action: "", id: "personal" },
  ];

  return (
    <div className="p-6 w-72 bg-white shadow-lg rounded-md space-y-4">
      <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
      <ul>
        {links.map((link) => (
          <li
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="flex justify-between items-center py-2 text-gray-800 hover:bg-gray-100 rounded-md px-4 cursor-pointer"
          >
            <span>{link.name}</span>
            {link.action && (
              <a
                href="#"
                className="text-blue-500 text-sm hover:underline"
              >
                {link.action}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLinks;
