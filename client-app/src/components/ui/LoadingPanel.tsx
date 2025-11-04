import type { ReactNode } from 'react';

type Props = {
	/** Optional class names to apply to the root container */
	className?: string;
	/** Text to show next to the dots (default: "Loading") */
	text?: string;
	children?: ReactNode;
};

/**
 * LoadingPanel
 * Small, reusable inline loading panel with animated dots.
 */
export default function LoadingPanel({ className = '', text = 'Loading' }: Props) {
	return (
		<div className={`flex items-center justify-center py-12 ${className}`.trim()}>
			{/* Inline styles for the dot animation. Kept minimal and scoped by class names. */}
			<style>{`
				.__loading-dots { display: inline-flex; align-items: center; gap: 0.375rem; }
				.__loading-dots span { display:inline-block; width:0.375rem; height:0.375rem; border-radius:9999px; background:currentColor; opacity:0.25; transform: translateY(0); animation: __loadingBounce 1s infinite ease-in-out; }
				.__loading-dots span:nth-child(1){ animation-delay: 0s }
				.__loading-dots span:nth-child(2){ animation-delay: 0.15s }
				.__loading-dots span:nth-child(3){ animation-delay: 0.3s }
				@keyframes __loadingBounce { 0% { opacity:0.25; transform: translateY(0); } 50% { opacity:1; transform: translateY(-4px); } 100% { opacity:0.25; transform: translateY(0); } }
			`}</style>

			<div className="flex flex-col items-center text-gray-700">
				<span className="text-xl">{text}</span>
				<span className="__loading-dots mt-3" aria-hidden>
					<span />
					<span />
					<span />
				</span>
			</div>
		</div>
	);
}
