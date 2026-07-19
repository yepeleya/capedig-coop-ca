// Boîte de confirmation non bloquante — remplace window.confirm()/alert()
// dans les pages admin (dialogues bloquants = mauvaise UX + souvent des
// oublis de debug).
export default function ConfirmDialog({ open, title = 'Confirmer', message, danger = false, confirmLabel = 'Confirmer', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div
      onClick={e => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" style={{ animation: 'scaleIn 0.3s ease both' }}>
        <h3 className="font-display text-[17px] font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13.5px] text-gray-600 mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-[13.5px] font-semibold text-gray-600 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-capedig-orange hover:opacity-90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
