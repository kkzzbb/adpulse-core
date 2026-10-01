import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { archiveCampaign } from "../../api/campaigns";
import { campaignKeys } from "../../query/campaignKeys";
import type { Campaign } from "../../types/campaign";

interface ArchiveCampaignButtonProps {
  campaign: Campaign;
}

export function ArchiveCampaignButton({campaign}: ArchiveCampaignButtonProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const archiveBlocked = campaign.status === "ACTIVE";
  const archiveMutation = useMutation({
      mutationFn: () => archiveCampaign(campaign.id),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
						queryKey: campaignKeys.list(),
            refetchType: "none",
            }),
          queryClient.invalidateQueries({
              queryKey: campaignKeys.detail(campaign.id),
              refetchType: "none"
            }),
        ]);
        navigate("/");
      },
    });

  function handleArchive() {
    const confirmed = window.confirm(`Archive "${campaign.name}"?`);

    if (!confirmed) {
      return;
    }

    archiveMutation.mutate();
  }

  return (
    <section>
      <h2>
        Archive
      </h2>

      {archiveBlocked && (
        <p className="notice">
          Active campaigns must be paused or completed
          before they can be archived.
        </p>
      )}

      <button
        className="button button--danger"
        type="button"
        disabled={archiveBlocked || archiveMutation.isPending}
        onClick={handleArchive}
      > 
				{archiveMutation.isPending ? "Archiving..." : "Archive campaign"}
      </button>


      {archiveMutation.isError && (<p className="form-error" role="alert">
          {archiveMutation.error.message}</p>)}
    </section>
  );
}