import { useState, useEffect } from 'react';

interface WindowSize {
	width: number,
	height: number,
}

export function useWindowSize() {
	const initialValue: WindowSize = {
		width: window.innerWidth,
		height: window.innerHeight,
	};
	const [size, setSize] = useState(initialValue);
	useEffect(() => {
		function handleResize() {
			const updatedSize: WindowSize = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
			setSize(updatedSize);
		}
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	return size;
}
