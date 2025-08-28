import React, { useState, useRef, useEffect } from 'react';
import './styles/App.css';

export default function App() {
	const [words, setWords] = useState([]);
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [answer, setAnswer] = useState('');
	const [correctCount, setCorrectCount] = useState(0);
	const [wordsSeen, setWordsSeen] = useState(0);
	const [totScore, setTotScore] = useState(0.0);
	const [correctScore, setCorrectScore] = useState(0.0);
	const [showModal, setShowModal] = useState(false);
	const [newWord, setNewWord] = useState('');
	const [toast, setToast] = useState({ message: '', type: '' });
	const inputRef = useRef(null);

	useEffect(() => {
		fetch('http://localhost:6060/words')
			.then(res => res.json())
			.then(data => {
				setWords(data.words)
				console.log(data.words)
			})
			.catch(console.error);
	}, []);

	const showToast = (msg, type) => {
		setToast({ message: msg, type });
		setTimeout(() => setToast({ message: '', type: '' }), 1000);
	};

	const goToNextWord = () => {
		fetch('http://localhost:6060/checkDefinition', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				word: words[currentWordIndex],
				definition: answer
			})
		})
			.then(res => res.json())
			.then(data => {
				console.log(typeof(data.verdict));
				let verdict = data.score >= 0.75
				if (verdict >= 0.75) {
					setCorrectCount(c => c + 1);
					setCorrectScore(score => score + data.score);
				}
				setTotScore(score => score + data.score);
				setWordsSeen(s => s + 1);
				showToast(verdict ? 'Correct' : 'Incorrect', 
					verdict ? 'correct' : 'incorrect');
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
		const w = newWord.trim().toLowerCase();
		if(w) {
			fetch('http://localhost:6060/insertWord', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word: w
				})
			});
			setWords(words => [...words, w]);
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
			
			<div className="total-words-container">
				Total words: {words.length}
			</div>

			<div className="accuracy-container">
				Accuracy: {correctCount} / {wordsSeen}
			</div>

			{/* <div className="total-score-container">
				Average total score: {wordsSeen == 0 ? 0 : totScore / correctCount}
			</div> */}

			<div className="correct-score-container">
				Average correct score: {wordsSeen == 0 ? 0 : correctScore / wordsSeen}
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
