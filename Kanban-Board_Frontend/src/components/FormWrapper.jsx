const FormWrapper = ({ title, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-100 tracking-wide">
          {title}
        </h2>
        <div className="text-lg text-gray-200 space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default FormWrapper;
