export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div className="bg-secondary border border-border rounded-xl p-8 w-full max-w-[480px] shadow-lg animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[1.3rem] font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}
