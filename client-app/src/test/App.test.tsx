import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
	it('renders navigation with DRCCS logo', () => {
		render(<App />);
		expect(screen.getByText('DRCCS')).toBeInTheDocument();
	});

	it('renders dashboard link', () => {
		render(<App />);
		expect(screen.getByText('Dashboard')).toBeInTheDocument();
	});
});
