import React from 'react';

type Variant = 'primary' | 'danger' | 'success' | 'outline' | 'ghost' | 'disabled' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	className?: string;
}

const variantClasses: Record<Variant, string> = {
	primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
	danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
	success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500',

	outline:
		'border border-gray-300 text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 active:bg-blue-100 focus:ring-blue-500',
	ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
	disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none',
	secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-400',
};

export default function Button({
	variant = 'primary',
	className = '',
	children,
	...rest
}: ButtonProps) {
	const base =
		'inline-flex items-center justify-center px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
	const cls = `${base} ${variantClasses[variant]} ${className}`.trim();
	return (
		<button className={cls} aria-disabled={rest.disabled} {...rest}>
			{children}
		</button>
	);
}
