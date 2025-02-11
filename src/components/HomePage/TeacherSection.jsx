const TeacherSection = ({ onSelectRole }) => {
  return (
    <div
      className="relative bg-teal-600 overflow-hidden md:px-5  transition-all duration-300 hover:shadow-2xl"
      style={{
        backgroundImage: `url('')`,
      }}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-700/40 via-teal-600/30 to-transparent" />

      {/* Content container with improved spacing */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 md:gap-8 items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Left Section with better mobile handling */}
        <div className="text-white md:ml-8 lg:ml-16 py-5 md:py-0 transform transition-all duration-500 hover:scale-[1.01]">
          <div className="flex flex-1 items-center">
            <h1 className="text-2xl font-hindi sm:text-3xl xl:text-2xl font-bold mb-4 sm:mb-6 flex flex-wrap items-center group">
              <span className="whitespace-nowrap">क्या आप</span>
              <span
                className="md:text-5xl xl:text-4xl font-bold text-orange-300 mx-2 transition-all duration-300 hover:text-orange-400 hover:drop-shadow-lg"
                style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}
              >
                Teacher
              </span>
              <span className="whitespace-nowrap">बनना चाहते हैं?</span>
            </h1>
          </div>

          {/* Text container with better readability */}
          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <p className="text-lg sm:text-xl leading-relaxed font-serif opacity-90 hover:opacity-100 transition-opacity duration-300">
              क्या आपने कभी सोचा है कि आप अगली पीढ़ी को कैसे आकार देंगे? आज ही
              आवेदन करें और हमारे मिशन का हिस्सा बनें! बोनस: आप सबसे कूल टीचर बन
              जाएंगे (कम से कम छात्रों की नजर में)! 🌟
            </p>
          </div>

          {/* Enhanced button styling */}
          <div className="w-full md:block flex justify-start md:justify-center">
            <button
              onClick={() => onSelectRole("teacher")}
              className="relative overflow-hidden bg-gradient-to-r from-orange-300 to-amber-400 text-teal-800 font-semibold text-lg px-8 py-2 rounded-full shadow-xl hover:shadow-2xl
                     transform transition-all duration-300 hover:scale-105 active:scale-95
                     ring-2 ring-white/20 hover:ring-white/40 focus:outline-none focus:ring-4 focus:ring-white/60
                     hover:bg-gradient-to-br"
            >
              <span className="relative z-10">Explore More..</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Right Section with improved responsiveness */}
        <div className="relative mt-8 md:mt-10 lg:mt-0 text-center flex items-center justify-center group">
          <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-72 xl:w-96 xl:h-96 mx-auto overflow-hidden rounded-2xl transform transition-all duration-500 hover:scale-95 mt-4">
            <img
              src="https://pngimg.com/d/teacher_PNG84.png"
              alt="Classroom"
              className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-110"
              style={{
                filter: "drop-shadow(0 25px 25px rgb(0 0 0 / 0.25))",
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
          </div>

          {/* Animated background elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-teal-400/10 rounded-full animate-pulse" />
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-orange-300/10 rounded-full animate-pulse delay-300" />

          {/* Floating dots around image */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${6 + i}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced particles animation */}
      <div className="absolute inset-0 overflow-hidden mix-blend-screen">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full animate-float"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${8 + (i % 5)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherSection;
