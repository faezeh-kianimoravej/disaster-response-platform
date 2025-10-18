export async function getBase64FromImagePath(path: string): Promise<string> {
	const response = await fetch(path);
	const blob = await response.blob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64 = reader.result?.toString().replace(/^data:.+;base64,/, '');
			resolve(base64 || '');
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
