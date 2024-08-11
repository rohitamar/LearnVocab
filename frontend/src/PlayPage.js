import React, { useState, useEffect } from 'react';

const PlayPage = () => {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [definition, setDefinition] = useState('');

    useEffect(() => {
        fetch('http://localhost:6060/words')
        .then(response => response.json())
        .then(res => res.map(item => item['word']))
        .then(res => [... new Set(res)])
        .then(data => setWords(data))
        .catch(error => console.error('Error fetching words:', error));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:6060/checkDefinition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'word': words[currentIndex],
                'definition': definition
            })
        })
        .then(response => response.json())
        .then(response => {
            let form = document.getElementsByClassName('form');
            form = form[0];
            console.log(response);
            if(response['verdict']) {
                form.style.borderColor = 'green';
                form.style.borderWidth = '2px';
                form.style.borderStyle = 'solid';
            } else {
                form.style.borderColor = 'red';
                form.style.borderWidth = '2px';
                form.style.borderStyle = 'solid';
            }

            setTimeout(() => {
                form.style.borderColor = '';
                form.style.borderWidth = '';
                form.style.borderStyle = '';
                setDefinition('');
                setCurrentIndex((currentIndex + 1) % words.length);
            }, 500);
        })
    };

    if (words.length === 0) {
        return <div>Loading words...</div>;
    }

    return (
        <div style={styles.container}>
            <form className = 'form' onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.wordContainer}>
                    <strong style={styles.word}>{words[currentIndex]}</strong>
                </div>
                <textarea
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Type your definition here"
                    style={styles.textarea}
                />
                <button type="submit" style={styles.button}>Submit</button>
            </form>
        </div>
      );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    wordContainer: {
        marginBottom: '20px',
    },
    word: {
        fontSize: '32px', // Larger font size for the word
        color: '#333',
    },
    textarea: {
        width: '500px', // Larger width for the textarea
        height: '150px', // Larger height for the textarea
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px',
        resize: 'vertical', // Allows vertical resizing
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default PlayPage;