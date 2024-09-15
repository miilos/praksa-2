export default function Button({ cssClass, children, onClick, disabled }) {
  return (
    <button className={cssClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
