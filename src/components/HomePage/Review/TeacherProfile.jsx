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
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Saurav Kumar",
      position: "English Teacher",
      review:
        "I'm grateful for the opportunities provided by this platform. It helped me land my dream job as an English teacher!",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Gaurav Kumar",
      position: "Science Teacher",
      review:
        "This community truly supports teachers. I got placed in a reputable school, and I couldn't be happier!",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Pooja Verma",
      position: "Physics Teacher",
      review:
        "Thanks to this platform, I found a perfect job opportunity where I can grow and thrive!",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
    {
      name: "Amit Kumar",
      position: "Chemistry Teacher",
      review:
        "The support and guidance I received here were phenomenal. It truly changed my life!",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lj549Z4QM6fK3VGKET92tXP2Ad4fPzuNuA&s",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
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
    <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-outfit">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-100 bg-emerald-50/50 w-fit mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Success Stories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6">
            Our Teachers <span className="text-emerald-600 block mt-2">Who Got Placed</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
            Meet the amazing educators who secured their dream jobs through our community. Their success stories inspire us every day!
          </p>
        </header>

        <Slider {...settings}>
          {teachers.map((teacher, index) => (
            <div key={index} className="px-3">
              <div className="bg-[#fcfdfd] rounded-lg border border-slate-200 p-6 h-56 flex flex-col justify-between hover:border-slate-300 transition-colors">
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed flex-1">
                  "{teacher.review}"
                </p>
                <div className="flex items-center mt-4 pt-4 border-t border-slate-100">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-11 h-11 rounded-lg object-cover mr-4 border border-slate-100"
                  />
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-600">
                      {teacher.position}
                    </p>
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
