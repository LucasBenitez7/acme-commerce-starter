import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <button>
        <Link href="/admin/orders">Ir al order manager</Link>
      </button>
    </div>
  );
}
