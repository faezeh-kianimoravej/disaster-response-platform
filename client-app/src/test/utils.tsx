import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Test utility function to render components with Router
export const renderWithRouter = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Test utility function to render components with all providers
export const renderWithProviders = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>);
};
