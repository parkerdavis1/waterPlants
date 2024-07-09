import fs from 'fs/promises';

export async function getImageBuffer(filePath: string): Promise<Buffer> {
	const image = await fs.readFile(filePath);
	return image;
	// const response = await fetch(imageUrl);
	// const blob = await response.blob();
	// return Buffer.from(await blob.arrayBuffer());
}
