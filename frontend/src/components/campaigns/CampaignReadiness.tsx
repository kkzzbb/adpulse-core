interface CampaignReadinessProps {
  hasCreative: boolean;

  creativesLoading: boolean;
}

export function CampaignReadiness({
  hasCreative,
  creativesLoading,
}: CampaignReadinessProps) {

  return (
    <section className="panel">
      <p className="eyebrow">
        Launch
      </p>

      <h2>
        Campaign readiness
      </h2>

      <div className="readiness-list">
        <div>
          <span>
            Creative
          </span>

          <strong>
            {creativesLoading ? "Checking..." : hasCreative
                ? "Ready" : "Required"}
          </strong>
        </div>

        <div>
          <span>
            Targeting
          </span>

          <strong>
            Optional
          </strong>
        </div>

        <div>
          <span>
            Budget
          </span>

          <strong>
            Ready
          </strong>
        </div>
      </div>

      {!creativesLoading && !hasCreative && (
        <p>
          Add at least one creative before activating this campaign.
        </p>
      )}
    </section>
  );
}