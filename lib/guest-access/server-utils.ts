import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyGuestAccessOrRedirect(orderId: string) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(`guest_access_${orderId}`);

  if (!hasAccess) {
    redirect("/tracking");
  }

  return true;
}
