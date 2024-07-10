import fs from 'fs/promises';

export async function getImageBuffer(filePath: string): Promise<Buffer> {
	const image = await fs.readFile(filePath);
	return image;
}
