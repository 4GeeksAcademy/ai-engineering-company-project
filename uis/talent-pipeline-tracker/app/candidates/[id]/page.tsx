import { CandidateDetailPage } from "@/components/candidate-detail-page";

type CandidateDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateDetailRoute({
  params,
}: CandidateDetailRouteProps) {
  const { id } = await params;

  return <CandidateDetailPage candidateId={id} />;
}