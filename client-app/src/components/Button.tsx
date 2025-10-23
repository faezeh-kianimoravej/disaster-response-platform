import React from 'react';

type Variant = 'primary' | 'danger' | 'success' | 'outline' | 'ghost' | 'disabled' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	className?: string;
}

const variantClasses: Record<Variant, string> = {
	primary: 'bg-blue-600 text-white',
	danger: 'bg-red-600 text-white',
	success: 'bg-green-600 text-white',

	outline:
		'border text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200',
	ghost: 'bg-transparent text-gray-700',
	disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
	secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
};

export default function Button({
	variant = 'primary',
	className = '',
	children,
	...rest
}: ButtonProps) {
	const base = 'px-4 py-2 rounded disabled:opacity-60';
	const cls = `${base} ${variantClasses[variant]} ${className}`.trim();
	return (
		<button className={cls} {...rest}>
			{children}
		</button>
	);
}
