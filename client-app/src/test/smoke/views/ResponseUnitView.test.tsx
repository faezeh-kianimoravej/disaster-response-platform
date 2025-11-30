import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResponseUnitView from '@/components/views/ResponseUnitView';
import type { ResponseUnit } from '@/types/responseUnit';

const sample = {
	unitId: 1,
	unitName: 'Test Unit',
	unitType: 'Ambulance',
	status: 'AVAILABLE',
	departmentId: 2,
	currentDeploymentId: 99,
	latitude: 12.34,
	longitude: 56.78,
	defaultResources: [{ resourceId: 7, quantity: 2, isPrimary: true }],
	defaultPersonnel: [{ userId: 11, specialization: 'paramedic', isRequired: true }],
	currentResources: [{ resourceId: 8, quantity: 1, isPrimary: false }],
	currentPersonnel: [{ userId: 21, specialization: 'paramedic' }],
} as unknown as ResponseUnit;

describe('ResponseUnitView', () => {
	it('renders many sections and buttons', () => {
		render(
			<ResponseUnitView
				responseUnit={sample}
				onBack={() => {}}
				onDelete={() => {}}
				onEdit={() => {}}
			/>
		);

		// Header and basic info
		expect(screen.getByText('Test Unit')).toBeTruthy();
		expect(screen.getByText('Unit Type')).toBeTruthy();
		expect(screen.getByText('Status')).toBeTruthy();

		// Current deployment
		expect(screen.getByText('Current Deployment')).toBeTruthy();
		expect(screen.getByText('99')).toBeTruthy();

		// Coordinates
		expect(screen.getByText('Latitude')).toBeTruthy();
		expect(screen.getByText('Longitude')).toBeTruthy();

		// Default and current resources/personnel
		expect(screen.getByText('Default Resources')).toBeTruthy();
		expect(screen.getByText('Default Personnel')).toBeTruthy();
		expect(screen.getByText('Current Resources')).toBeTruthy();
		expect(screen.getByText('Current Personnel')).toBeTruthy();

		// Buttons
		expect(screen.getByText('Back')).toBeTruthy();
		expect(screen.getByText('Edit')).toBeTruthy();
		expect(screen.getByText('Delete')).toBeTruthy();
	});
});
