"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      className="btn danger small"
      onClick={(e) => {
        if (!confirm("Supprimer définitivement cette réponse ?")) e.preventDefault();
      }}
    >
      Supprimer
    </button>
  );
}
