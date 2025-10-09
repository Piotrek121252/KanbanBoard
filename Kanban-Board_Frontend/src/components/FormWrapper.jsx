const FormWrapper = ({ title, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default FormWrapper;
