type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
  };
  
  export default function Modal({ children, onClose }: ModalProps) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            ✖
          </button>
          {children}
        </div>
      </div>
    );
  }
  