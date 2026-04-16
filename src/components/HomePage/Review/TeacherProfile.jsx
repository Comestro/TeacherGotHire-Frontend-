import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
    {
      name: "Pooja Verma",
      position: "Physics Teacher",
      review:
        "Thanks to this platform, I found a perfect job opportunity where I can grow and thrive!",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Amit Kumar",
      position: "Chemistry Teacher",
      review:
        "The support and guidance I received here were phenomenal. It truly changed my life!",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true, 
    autoplaySpeed: 2000, 
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="bg-slate-100 py-12 w-full">
      <div className=" mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Our Teachers <span className="text-orange-400"  style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}>Who Got Placed</span>
        </h2>
        <p className="text-gray-600 font-serif mb-8">
          Meet the amazing teachers who secured jobs through our community.
          Their success stories inspire us every day!
        </p>
        <Slider {...settings}>
          {teachers.map((teacher, index) => (
            <div key={index} className="p-4">
              <div className="bg-white h-52 rounded-lg shadow-md overflow-hidden p-6 text-left">
                <p className="text-gray-600 font-serif italic mb-4">"{teacher.review}"</p>
                <div className="flex items-center">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-14 h-14 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-gray-700 tracking-wider">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-teal-700">{teacher.position}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default TeacherProfiles;
