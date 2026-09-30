export interface Creative {
	id: string;
	campaignId: string;
	headline: string;
	body: string;
	destinationUrl: string;
}

export interface CreateCreativeInput {
	headline: string;
	body: string;
	destinationUrl: string;
}