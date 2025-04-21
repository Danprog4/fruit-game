type InputProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
};

export const Input = ({ searchQuery, setSearchQuery, placeholder, icon }: InputProps) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="relative mt-[21px] w-full">
        <div className="absolute top-1/2 left-[15px] flex -translate-y-1/2 items-center">
          {icon}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="h-[42px] w-full rounded-full bg-[#F7FFEB0F] pr-[35px] pl-[50px] text-xs text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none"
          size={500}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
          <button className="text-white hover:text-white">
            <div className="flex h-[29px] w-[82px] items-center justify-center rounded-full bg-[#76AD10]">
              <div className="font-manrope text-xs font-medium">Искать</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
