import "./ConfirmLogoutModal.css";

export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay">
      <div className="modal">
        <h2>Sair da conta</h2>

        <p>Tem certeza que deseja sair da conta?</p>

        <div className="buttons">
          <button
            className="cancelButton"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="confirmButton"
            onClick={onConfirm}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}