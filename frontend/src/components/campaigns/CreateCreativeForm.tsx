import { useState } from "react";
import { createCreative } from "../../api/creatives";
import type { Creative } from "../../types/creative";

interface CreateCreativeFormProps {
	campaignId: string;

	onCreativeCreated: (creative: Creative) => void;
}

export function CreateCreativeForm({campaignId, onCreativeCreated}: CreateCreativeFormProps) {
	const [headline, setHeadline] = useState("");
	const [body, setBody] = useState("");
	const [destinationUrl, setDestinationUrl] = useState("");
	const [submitting, setSubmitting ] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(
		event: React.FormEvent<HTMLFormElement>){
			event.preventDefault();

			const trimmedHeadline = headline.trim();
			const trimmedBody = body.trim();
			const trimmedDestinationUrl = destinationUrl.trim();
			console.log("Headline: ", trimmedHeadline);
			if (!trimmedHeadline) {
				setError("Headline is required");
				return;
			}

			if (!trimmedBody) {
      	setError("Creative body is required");
	      return;
  	  }

	    if (!trimmedDestinationUrl) {
      	setError("Destination URL is required");

      	return;	
    	}

			setSubmitting(true);
			setError(null);

			try {
				const creative = await createCreative(campaignId, {
					headline: trimmedHeadline,
					body: trimmedBody,
					destinationUrl: trimmedDestinationUrl
				});
			
				onCreativeCreated(creative);

				setHeadline("");
				setBody("");
				setDestinationUrl("");
			} catch (error: unknown) {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("An unknown error occured");
				}
			} finally {
				setSubmitting(false);
			}
		}

		return (
			<form onSubmit={handleSubmit}>
				<h2>
					Add creative
				</h2>

				<label>
					Headline

						<input
							type="text"
							value={headline}
							disabled={submitting}
							onChange={(event) => setHeadline(event.target.value)}
						/>
				</label>

				<label>
					Body
					
					<textarea
						value={body}
						disabled={submitting}
						onChange={(event) => setBody(event.target.value)}
					/>
				</label>

				<label>
					Desination URL
					<input
						type="url"
						value={destinationUrl}
						disabled={submitting}
						placeholder="https://example.com"
						onChange={(event) => setDestinationUrl(event.target.value)}
					/>
				</label>

				<button
					type="submit"
					disabled={submitting}
				>
					{submitting? "Creating..." : "Add creative"}
				</button>

				{error && (<p>{error}</p>)}
			</form>
	);
}