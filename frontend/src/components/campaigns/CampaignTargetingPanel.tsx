import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCampaignTargeting } from "../../api/targeting";
import { campaignKeys } from "../../query/campaignKeys";
import { targetingQueries } from "../../query/targetingQueries";
import type { CampaignStatus } from "../../types/campaign";
import { campaignDevices } from "../../types/targeting";
import type { CampaignDevice, CampaignTargeting, UpdateCampaignTargetingInput,
} from "../../types/targeting";

interface CampaignTargetingPanelProps {
  campaignId: string;

  campaignStatus: CampaignStatus;
}

function formatDevice(device: CampaignDevice): string {
		switch (device) {
    	case "DESKTOP":
      	return "Desktop";

    	case "MOBILE":
      	return "Mobile";

    	case "TABLET":
      	return "Tablet";
 	}
}

export function CampaignTargetingPanel(
	{campaignId, campaignStatus}: CampaignTargetingPanelProps) {

  const queryClient = useQueryClient();
  const targetingQuery = useQuery(targetingQueries.detail(campaignId));
  
	const [countriesInput, setCountriesInput] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<CampaignDevice[]>([]);
  const [ageMinInput, setAgeMinInput] = useState("");
  const [ageMaxInput, setAgeMaxInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

	const isEditable = campaignStatus === "DRAFT";

  useEffect(() => {
			const targeting = targetingQuery.data;

			if (!targeting) {
				return;
			}

			setCountriesInput(targeting.countries.join(", "));

			setSelectedDevices(targeting.devices);

			setAgeMinInput(targeting.ageMin === null ? "" : String(targeting.ageMin));

			setAgeMaxInput(targeting.ageMax === null ? "" : String(targeting.ageMax));
		},
		
		[targetingQuery.data]
	);

	const updateMutation = useMutation({
		mutationFn: (input: UpdateCampaignTargetingInput) =>
      updateCampaignTargeting(campaignId, input),

		onSuccess: (targeting: CampaignTargeting) => {
      queryClient.setQueryData(campaignKeys.targeting(campaignId), targeting);
    },
  });

  function toggleDevice(device: CampaignDevice) {
    setSelectedDevices((current) => {
      
			if (current.includes(device)) {
      	return current.filter((item) => item !== device);
    	}

    	return [...current, device];
    	},
  	);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditable) {
      return;
    }

    const countries =
      [
				...new Set(countriesInput.split(",").map(
        (country) => country.trim().toUpperCase())
        .filter(Boolean))
      ];

    const invalidCountry =
      countries.find((country) => !/^[A-Z]{2}$/.test(country));


    if (invalidCountry) {
      setValidationError(
        `"${invalidCountry}" is not a valid two-letter country code`
      );

    return;
  }

	const ageMin = ageMinInput === "" ? null : Number(ageMinInput);
  const ageMax = ageMaxInput === "" ? null : Number(ageMaxInput);

  if (ageMin !== null && (!Number.isInteger(ageMin) ||
        ageMin < 13 || ageMin > 100)) {
    setValidationError(
      "Minimum age must be a whole number from 13 to 100",
    );

		return;
  }


  if (ageMax !== null && (!Number.isInteger(ageMax) ||
        ageMax < 13 || ageMax > 100)) {
    setValidationError(
      "Maximum age must be a whole number from 13 to 100",
    );

		return;
  }

  if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
    setValidationError(
      "Maximum age must be greater than or equal to minimum age",
    );

    return;
  }

	setValidationError(null);

	updateMutation.mutate({
			countries,
			devices: selectedDevices,
			ageMin,
			ageMax,
		});
	}

  if (targetingQuery.isPending) {
    return (
      <section className="panel">
        <h2>
          Targeting
        </h2>

        <p>
          Loading targeting...
        </p>
      </section>
    );
  }

  if (targetingQuery.isError) {
    return (
      <section className="panel">
        <h2>
          Targeting
        </h2>

        <p
          className="form-error"
          role="alert"
        >
          {targetingQuery.error.message}
        </p>

        <button
          type="button"
          className="button button--secondary"
          onClick={() => {void targetingQuery.refetch();}}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Audience
          </p>

          <h2>
            Targeting
          </h2>
        </div>

        {!isEditable && (
          <span>
            Locked after activation
          </span>
        )}
      </div>

      <form 
				onSubmit={handleSubmit}
        className="targeting-form"
      >
        <div className="form-field">
          <label htmlFor="targeting-countries">
            Countries
          </label>

          <input
            id="targeting-countries"
            type="text"
            placeholder="FI, SE, DE"
            value={countriesInput}
            disabled={!isEditable ||updateMutation.isPending}
            onChange={(event) => {setCountriesInput(event.target.value);}}
          />

          <small>
            Enter two-letter country codes separated by commas.
            Leave empty for all countries.
          </small>
        </div>

        <fieldset
          className="targeting-devices"
          disabled={!isEditable || updateMutation.isPending}
        >
          <legend>
            Devices
          </legend>

					<div className="checkbox-box">
						{campaignDevices.map((device) => (
							<label key={device}>
								<input
									type="checkbox"
									checked={selectedDevices.includes(device)}
									onChange={() => {toggleDevice(device);}}
								/>
									{formatDevice(device)}
								</label>
            	)
          	)}
					</div>

          <small>
            Leave every device unchecked to target all devices.
          </small>
        </fieldset>

        <div className="targeting-age-grid">
          <div className="form-field">
            <label htmlFor="targeting-age-min">
              Minimum age
            </label>

            <input
              id="targeting-age-min"
              type="number"
              min="13"
              max="100"
              value={ageMinInput}
              disabled={!isEditable || updateMutation.isPending}
              onChange={(event) => {setAgeMinInput(event.target.value);}}
            />
          </div>

          <div className="form-field">
            <label htmlFor="targeting-age-max">
              Maximum age
            </label>

            <input
              id="targeting-age-max"
              type="number"
              min="13"
              max="100"
              value={ageMaxInput}
              disabled={!isEditable || updateMutation.isPending}
              onChange={(event) => {setAgeMaxInput(event.target.value);}}
            />
          </div>
        </div>

        {validationError && (
          <p
            className="form-error"
            role="alert"
          >
            {validationError}
          </p>
        )}

        {updateMutation.isError && (
          <p
            className="form-error"
            role="alert"
          >
            {updateMutation.error.message}
          </p>
        )}

        {updateMutation.isSuccess && (
          <p className="form-success">
            Targeting saved.
          </p>
        )}

        {isEditable && (
          <button
            type="submit"
            className="button button--primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save targeting"}
          </button>
        )}
      </form>
    </section>
  );
}