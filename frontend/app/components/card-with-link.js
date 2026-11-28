import Link from "next/link";

export default function CardWithLink({
  href="#",
  variant = "default",
  title,
  name,
  description,
}) {
  const bgColor = variant === "success" 
                  ? "bg-success-content"
                  : variant === "primary"
                  ? "bg-primary"
                  : variant === "pink"
                  ? "bg-error"
                  : variant === "danger"
                  ? "bg-error-content"
                  : variant === "default"
                  ? "bg-base-content"
                  : ""
  return (
    <Link href={href}>
      <label className={`card ${bgColor} text-base-200`}>
        <input type="checkbox" name={name} />
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
        </div>
      </label>
    </Link>
  );
}
