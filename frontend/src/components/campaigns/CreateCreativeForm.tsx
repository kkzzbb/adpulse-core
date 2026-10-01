import { useState, } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCreative } from "../../api/creatives";
import { campaignKeys } from "../../query/campaignKeys";
import type { CreateCreativeInput } from "../../types/creative";

interface CreateCreativeFormProps {
  campaignId: string;
}

export function CreateCreativeForm({campaignId}: CreateCreativeFormProps) {
  const queryClient = useQueryClient();
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const createCreativeMutation = useMutation({
      mutationFn: (input:CreateCreativeInput) => createCreative(campaignId, input),
      onSuccess: async () => {
				setHeadline("");
        setBody("");
        setDestinationUrl("");

        await queryClient.invalidateQueries({queryKey:campaignKeys.creatives(campaignId)});
      }
    });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedHeadline = headline.trim();
    const trimmedBody = body.trim();
    const trimmedDestinationUrl = destinationUrl.trim();

    if (!trimmedHeadline) {
      setValidationError("Headline is required");
      return;
    }

    if (!trimmedBody) {
      setValidationError("Creative body is required");
      return;
    }

    if (!trimmedDestinationUrl) {
      setValidationError("Destination URL is required");
      return;
    }

    setValidationError(null);

    createCreativeMutation.mutate({
      headline: trimmedHeadline,
      body: trimmedBody,
      destinationUrl: trimmedDestinationUrl
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>
        Add creative
      </h2>

      <label htmlFor="creative-headline">
        Headline
      </label>

      <input
        id="creative-headline"
        type="text"
        value={headline}
        disabled={createCreativeMutation.isPending}
        onChange={(event) => {setHeadline(event.target.value);}}
      />

      <label htmlFor="creative-body">
        Body
      </label>

      <textarea
        id="creative-body"
        value={body}
        disabled={createCreativeMutation.isPending}
        onChange={(event) => {setBody(event.target.value);}}
      />

      <label htmlFor="creative-destination-url">
        Destination URL
      </label>

      <input
        id="creative-destination-url"
        type="url"
        value={destinationUrl}
        disabled={createCreativeMutation.isPending}
        placeholder="https://example.com"
        onChange={(event) => {setDestinationUrl(event.target.value);
        }}
      />

      {validationError && (<p className="form-error" role="alert">{validationError}</p>)}

      {createCreativeMutation.isError && (
        <p className="form-error" role="alert">{createCreativeMutation.error.message}</p>
      )}

      <button
        className="button button--primary"
        type="submit"
        disabled={createCreativeMutation.isPending}
      >
        {createCreativeMutation.isPending
          ? "Creating..." : "Add creative"}
      </button>
    </form>
  );
}