import { redirect } from "next/navigation";
import { isOperator } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isOperator()) redirect("/operator");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">운영자 로그인</h1>
      <LoginForm />
    </div>
  );
}
