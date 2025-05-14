import { redirect } from "next/navigation";

export default function Home() {
  redirect("/consulta");
  return null;
}
