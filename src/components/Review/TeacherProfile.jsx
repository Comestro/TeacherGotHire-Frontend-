import React from "react";

const TeacherProfiles = () => {
  const teachers = [
    {
      name: "Rahul Kumar",
      position: "Math Teacher",
      review:
        "Getting a job through this community was a game-changer for me. The process was smooth, and the support was excellent!",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Saurav Kumar",
      position: "English Teacher",
      review:
        "I’m grateful for the opportunities provided by this platform. It helped me land my dream job as an English teacher!",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Gaurav Kumar",
      position: "Science Teacher",
      review:
        "This community truly supports teachers. I got placed in a reputable school, and I couldn’t be happier!",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
  ];

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Our Teachers <span className="text-teal-600">Who Got Placed</span>
        </h2>
        <p className="text-gray-600 mb-8">
          Meet the amazing teachers who secured jobs through our community. Their success stories inspire us every day!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-left"
            >
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h3 className="text-xl font-serif font-semibold text-gray-700 tracking-wider">
                {teacher.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{teacher.position}</p>
              <p className="text-gray-600 italic">"{teacher.review}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherProfiles;
