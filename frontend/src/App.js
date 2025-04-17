// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

export default function App() {
	const [words, setWords] = useState([]);
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [answer, setAnswer] = useState('');
	const [correctCount, setCorrectCount] = useState(0);
	const [wordsSeen, setWordsSeen] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [newWord, setNewWord] = useState('');
	const [toast, setToast] = useState({ message: '', type: '' });
	const inputRef = useRef(null);

	useEffect(() => {
		fetch('http://10.0.0.197:6060/words')
			.then(res => res.json())
			.then(data => setWords(data.words))
			.catch(console.error);
	}, []);

	const showToast = (msg, type) => {
		setToast({ message: msg, type });
		setTimeout(() => setToast({ message: '', type: '' }), 1000);
	};

	const goToNextWord = () => {
		fetch('http://10.0.0.197:6060/checkDefinition', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				word: words[currentWordIndex],
				definition: answer
			})
		})
			.then(res => res.json())
			.then(data => {
				if (data.verdict) setCorrectCount(c => c + 1);
				setWordsSeen(s => s + 1);
				showToast(data.verdict ? 'Correct' : 'Incorrect', 
							data.verdict ? 'correct' : 'incorrect');
				setAnswer('');
				setCurrentWordIndex(i => (i + 1) % words.length);
				inputRef.current?.blur();
			})
			.catch(console.error);
	};

	const handleOverlayClick = e => {
		if (e.target === e.currentTarget) setShowModal(false);
	};

	const handleSubmitNewWord = e => {
		e.preventDefault();
		const w = newWord.trim();
		if(w) {
			fetch('http://10.0.0.197:6060/insertWord', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word: w
				})
			});
		}
		setNewWord('');
		setShowModal(false);
	};

	return (
		<div className="container">
			{toast.message && (
				<div className={`toast ${toast.type}`}>
					{toast.message}
				</div>
			)}
			<button
				className="add-word-button"
				onClick={() => setShowModal(true)}
			>
				Add Word
			</button>

			<div className="score-container">
				{correctCount} / {wordsSeen}
			</div>

			<div className="word-text">
				{words[currentWordIndex]}
			</div>

			<input
				ref={inputRef}
				className="input"
				type="text"
				placeholder="Enter the definition here..."
				value={answer}
				onChange={e => setAnswer(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') goToNextWord();
				}}
			/>

			{showModal && (
				<div
					className="modal-overlay"
					onClick={handleOverlayClick}
				>
					<div className="modal-content">
						<h2>Add New Word</h2>
						<form onSubmit={handleSubmitNewWord}>
							<input
								className="modal-input"
								type="text"
								value={newWord}
								onChange={e => setNewWord(e.target.value)}
								autoFocus
							/>
							<button type="submit">Submit</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
