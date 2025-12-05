const HomepageLoader = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-ink animate-fadeIn">

      {/* Floating glowing orb */}
      <div className="relative flex items-center justify-center">
        
        {/* Outer ring */}
        <div className="w-32 h-32 rounded-full border-4 border-secondary border-t-transparent animate-spin-slow shadow-floating"></div>

        {/* Middle ring */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-primary border-b-transparent animate-spin-fast"></div>

        {/* Inner pulse core */}
        <div className="absolute w-6 h-6 bg-accent rounded-full animate-ping"></div>
      </div>

      {/* Text */}
      <p className="mt-8 text-lg tracking-wide text-ink opacity-80 animate-floatUp">
        Setting up your shop..
      </p>
    </div>
  );
};

export default HomepageLoader;
