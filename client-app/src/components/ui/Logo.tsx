export default function Logo({
	withText = false,
	className = '',
}: {
	withText?: boolean;
	className?: string;
}) {
	return (
		<img
			src={withText ? '/logo-drccs.jpg' : '/favicon.jpg'}
			alt={withText ? 'DRCCS Logo' : 'DRCCS Icon'}
			className={`${className} h-8 w-auto object-contain`}
			style={{ display: 'block', margin: '0 auto' }}
		/>
	);
}
