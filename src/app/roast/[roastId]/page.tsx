import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

interface RoastPageProps {
  params: Promise<{ roastId: string }>;
}

export default function RoastPage({ params }: RoastPageProps) {
  return (
    <Suspense fallback={null}>
      {/* compatibility redirect */}
      <RoastRedirect params={params} />
    </Suspense>
  );
}

async function RoastRedirect({ params }: RoastPageProps) {
  await connection();

  const { roastId } = await params;

  redirect(`/result/${roastId}`);

  return null;
}
