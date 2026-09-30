const euroFormatter = new Intl.NumberFormat(undefined,
	{
		style: "currency",	currency: "EUR"
	});

export function formatCurrency(value: number): string {
	return euroFormatter.format(value);
}

