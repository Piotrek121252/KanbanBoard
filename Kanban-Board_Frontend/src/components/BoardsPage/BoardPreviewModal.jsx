import Modal from "../Modal";
import { FaUsers, FaGlobe, FaLock } from "react-icons/fa";

const roleColors = {
  ADMIN: "bg-red-900/60 border-red-700 text-red-300",
  EDITOR: "bg-blue-900/60 border-blue-700 text-blue-300",
  VIEWER: "bg-gray-800 border-gray-600 text-gray-300",
};

const BoardPreviewModal = ({ board, isOpen, onClose }) => {
  if (!board) return null;

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 text-white">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{board.name}</h2>

            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-800 border border-gray-700 text-gray-200">
              {board.isPublic ? <FaGlobe size={14} /> : <FaLock size={14} />}
              {board.isPublic ? "Publiczna" : "Prywatna"}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FaUsers /> Członkowie
          </h3>

          {board.members.length === 0 ? (
            <p className="text-gray-400 text-sm">Brak członków.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {board.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-gray-200 font-semibold">
                      {getInitials(member.username)}
                    </div>

                    <div>
                      <p className="text-gray-200 font-semibold">
                        {member.username}
                      </p>
                      <p className="text-gray-400 text-xs">{member.email}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-md border font-medium ${roleColors[member.boardRole]}`}
                  >
                    {member.boardRole}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          Zamknij
        </button>
      </div>
    </Modal>
  );
};

export default BoardPreviewModal;
