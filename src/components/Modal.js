export default function Modal({ title, text, cssClass, onClick }) {
  return (
    <div className={`modal ${cssClass}`}>
      <img
        src="./img/close-icon.png"
        alt="Close icon"
        className={"modal__close-btn"}
        onClick={onClick}
      />
      <h1 className="modal__heading-1">{title}</h1>
      <p className="modal__text">{text}</p>
    </div>
  );
}
