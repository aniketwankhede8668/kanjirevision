export default function Header({ user, onLogout }) {
  return (
    <div className="bar noprint">
      <h1>Practice Test</h1>
      <span>{user} <button className="ghost" onClick={onLogout}>Logout</button></span>
    </div>
  );
}
