import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin-app";
import { getCurrentUser } from "@/lib/session";

export default async function AdminHome() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <AdminApp user={{ email: user.email, roles: user.roles || [] }} />;
}
