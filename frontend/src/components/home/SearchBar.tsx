export default function SearchBar() {
  return (
    <div className="flex w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition duration-300 focus-within:border-blue-500 focus-within:shadow-xl">
      <div className="flex items-center pl-6 text-2xl text-gray-400">
        🔍
      </div>

      <input
        type="text"
        placeholder="Search smartphones, laptops, headphones..."
        className="flex-1 bg-transparent px-4 py-5 text-lg outline-none"
      />

      <button className="bg-blue-600 px-10 text-lg font-semibold text-white transition hover:bg-blue-700">
        Search
      </button>
    </div>
  );
}
