export const campaignKeys = 
{ 
	all: ["campaigns"] as const,

	list: () => [...campaignKeys.all, "list"] as const,

	detail: (campaignId: string) => 
		[...campaignKeys.all, "detail", campaignId] as const,

	creatives: (campaignId: string) =>
		[...campaignKeys.detail(campaignId), "creatives"] as const,
	
	targeting: (campaignId: string) =>
  	[...campaignKeys.detail(campaignId), "targeting"] as const,
};