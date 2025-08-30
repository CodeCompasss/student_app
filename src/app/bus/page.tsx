"use client";
import { busData } from "@/data/bus";

const BusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <div className="relative">
            <h1 className="text-[30px] font-bold text-black">College Bus</h1>
            {/* Decorative wave underline */}
            <svg 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-3" 
              viewBox="0 0 96 12" 
              fill="none"
            >
              <path 
                d="M2 6C8 2, 16 10, 24 6C32 2, 40 10, 48 6C56 2, 64 10, 72 6C80 2, 88 10, 94 6" 
                stroke="#000000" 
                strokeWidth="1" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-y-20 gap-4 px-10">
          {busData.map((bus, index) => (
            // Use BusButtons
            <button
              key={index}
              className="bg-white border border-black rounded-lg py-7 text-center shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                if ((bus as any).pdfUrl) {
                  window.open((bus as any).pdfUrl as string, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <span className="text-2xl font-bold text-black">{bus.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusPage;
