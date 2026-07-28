export default function Toast({ message, type }) {
  return (
    <div
      className={`
        rounded-lg
        px-4
        py-3
        shadow-lg
        text-white

        ${type === "success" ? "bg-green-600" : ""}
        ${type === "error" ? "bg-red-600" : ""}
        ${type === "warning" ? "bg-yellow-500" : ""}
        ${type === "info" ? "bg-blue-600" : ""}
      `}
    >
      {message}
    </div>
  );
}