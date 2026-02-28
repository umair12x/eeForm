// components/Logo.js
export default function Logo() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        {/* Shield Background */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
          {/* University Building */}
          <div className="relative w-16 h-16">
            {/* Main Building */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-8 bg-white rounded-t-lg"></div>
            {/* Pillars */}
            <div className="absolute bottom-0 left-4 w-2 h-6 bg-white"></div>
            <div className="absolute bottom-0 right-4 w-2 h-6 bg-white"></div>
            {/* Dome */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white rounded-full"></div>
            {/* Flag */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-yellow-400"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-green-500 rounded-r"></div>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-2xl blur-xl -z-10"></div>
      </div>
    </div>
  );
}