import Navbar from "./components/Navbar";

export default () => {
  return (
    <div className="bg-black">
      <Navbar />
      <div className="flex w-full h-[80vh] bg-black overflow-x-scroll">
        <span className="w-full h-full bg-black flex-none" />
        <span className="w-full h-full bg-red-800  flex-none" />
        <span className="w-full h-full bg-blue-900  flex-none" />
      </div>
    </div>
  );
};
