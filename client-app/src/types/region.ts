export interface Region {
	regionId: number;
	name: string;
	image: string;
	municipalities: Array<{
		municipalityId: number;
		name: string;
		image: string;
		regionId: number;
	}>;
}
