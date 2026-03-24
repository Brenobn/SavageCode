import { redirect } from "next/navigation";

interface RoastPageProps {
  params: Promise<{ roastId: string }>;
}

export default async function RoastPage({ params }: RoastPageProps) {
  const { roastId } = await params;

  redirect(`/result/${roastId}`);
}
