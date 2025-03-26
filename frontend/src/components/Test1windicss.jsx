const Test1windicss = () => {
    return (
      <div className="flex flex-wrap gap-4 p-6 bg-blue-600 bg-opacity-20 backdrop-blur-md shadow-lg rounded-xl w-full max-w-2xl mx-auto border border-blue-400">
        <input type="text" placeholder="Username" className="border-b-2 p-2 w-full bg-transparent focus:outline-none text-white placeholder-white" />
        <input type="password" placeholder="Password" className="border-b-2 p-2 w-full bg-transparent focus:outline-none text-white placeholder-white" />
        <input type="email" placeholder="Email" className="border p-2 rounded-md w-full bg-gray-700 text-white" />
        <input type="number" placeholder="Age" className="border p-2 rounded-md w-1/2 bg-gray-700 text-white" />
        <input type="date" className="border p-2 rounded-md w-1/2 bg-gray-700 text-white" />
        <input type="week" className="border p-2 rounded-md w-1/2 bg-gray-700 text-white" />
        <input type="color" className="w-10 h-10 border rounded-md" />
        <input type="range" className="w-full accent-blue-500" />
        <label className="flex items-center space-x-2 text-white">
          <input type="checkbox" className="w-5 h-5 accent-blue-500" />
          <span>Remember Me</span>
        </label>
        <label className="flex items-center space-x-2 text-white">
          <input type="radio" name="group" className="w-5 h-5 accent-red-500" />
          <span>Option 1</span>
        </label>
        <input type="file" className="border p-2 rounded-md w-full bg-gray-700 text-white" />
        <input type="time" className="border p-2 rounded-md w-1/2 bg-gray-700 text-white" />
        <input type="url" placeholder="Website URL" className="border p-2 rounded-md w-full bg-gray-700 text-white" />
      </div>
    );
  };
  
  export default Test1windicss;
  