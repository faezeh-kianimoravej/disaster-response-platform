import type { ReactNode } from 'react';

type BadgeVariant =
	| 'default'
	| 'critical'
	| 'high'
	| 'medium'
	| 'low'
	| 'info'
	| 'success'
	| 'warning'
	| 'danger';

interface BadgeProps {
	children: ReactNode;
	variant?: BadgeVariant;
	className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
	default: 'bg-gray-100 text-gray-700 border-gray-300',
	critical: 'bg-red-100 text-red-800 border-red-300',
	high: 'bg-orange-100 text-orange-800 border-orange-300',
	medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
	low: 'bg-green-100 text-green-800 border-green-300',
	info: 'bg-blue-100 text-blue-800 border-blue-300',
	success: 'bg-green-100 text-green-800 border-green-300',
	warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
	danger: 'bg-red-100 text-red-800 border-red-300',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
	const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium border';
	const variantClass = variantClasses[variant];

	return <span className={`${baseClasses} ${variantClass} ${className}`.trim()}>{children}</span>;
}
