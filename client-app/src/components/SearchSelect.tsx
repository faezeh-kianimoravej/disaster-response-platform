import React, { useEffect, useRef, useState } from 'react';

type SearchSelectProps<T> = {
	items: T[];
	getId: (item: T) => number;
	getLabel: (item: T) => string;
	value: number | null;
	onChange: (id: number | null) => void;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
};

export default function SearchSelect<T>({
	items,
	getId,
	getLabel,
	value,
	onChange,
	placeholder = 'Search...',
	className = 'w-64',
	inputClassName = '',
}: SearchSelectProps<T>) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [activeIndex, setActiveIndex] = useState<number>(0);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const listRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const options = items.filter(i => getLabel(i).toLowerCase().includes(query.trim().toLowerCase()));

	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!wrapperRef.current) return;
			if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	}, []);

	useEffect(() => {
		if (open && options.length > 0) setActiveIndex(0);
	}, [open, options.length]);

	useEffect(() => {
		if (!listRef.current) return;
		const node = listRef.current.querySelector(
			`[data-index="${activeIndex}"]`
		) as HTMLElement | null;
		if (node) node.scrollIntoView({ block: 'nearest' });
	}, [activeIndex]);

	const selected = items.find(i => getId(i) === value) ?? null;

	function selectItem(item: T) {
		onChange(getId(item));
		setQuery('');
		setOpen(false);
		inputRef.current?.blur();
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') setOpen(true);
			return;
		}

		const len = options.length;
		if (len === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActiveIndex(i => (i + 1) % len);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex(i => (i - 1 + len) % len);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const item = options[activeIndex] ?? options[0];
			if (item) selectItem(item);
		} else if (e.key === 'Tab') {
			if (e.shiftKey) return;
			if (activeIndex < len - 1) {
				e.preventDefault();
				setActiveIndex(i => (i + 1) % len);
			}
		}
	}

	const baseClasses = `mt-1 block w-full border rounded p-2 ${
		open
			? 'border-black border-2 focus:border-black focus:ring-black'
			: 'border-gray-300 focus:border-black focus:ring-black'
	} ${inputClassName}`;

	return (
		<div ref={wrapperRef} className={`relative ${className}`}>
			<label className="block text-sm font-medium text-gray-700">{placeholder}</label>
			<input
				ref={inputRef}
				className={baseClasses}
				value={query}
				onChange={e => {
					setQuery(e.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={onKeyDown}
				placeholder={selected ? getLabel(selected) : placeholder}
				aria-expanded={open}
				aria-haspopup="listbox"
			/>

			{open && (
				<div
					ref={listRef}
					role="listbox"
					className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border rounded shadow"
				>
					{options.length === 0 ? (
						<div className="p-2 text-sm text-gray-500">No results</div>
					) : (
						options.map((item, idx) => (
							<div
								key={getId(item)}
								data-index={idx}
								role="option"
								aria-selected={idx === activeIndex}
								className={`px-3 py-2 cursor-pointer text-sm ${idx === activeIndex ? 'bg-gray-100' : ''}`}
								onMouseDown={e => e.preventDefault()} // keep focus on input
								onClick={() => selectItem(item)}
							>
								{getLabel(item)}
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
