import React, { useState, useRef, useEffect } from 'react';
import { 
    Animated,
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    PanResponder,
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    const [words, setWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [correctCount, setCorrectCount] = useState(0);
    const [wordsSeen, setWordsSeen] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [newWord, setNewWord] = useState('');

    const [feedback, setFeedback] = useState(null);
    const borderAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        fetch('http://10.75.181.20:6060/words')
            .then(response => response.json())
            .then(data => {
                setWords(data['words']);
                return data['words'];
            })
            .catch(error => {
                console.error('Error fetching words:', error);
            });
      }, []);

    const goToNextWord = () => {
        fetch('http://10.75.181.20:6060/checkDefinition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                word: words[currentWordIndex], 
                definition: answer 
            })
        })
        .then(response => response = response.json())
        .then(data => {
            var isCorrect = data['verdict']; 
            if(isCorrect) {
                setCorrectCount(prev => prev + 1);
                setFeedback('correct');
            } else {
                setFeedback('wrong');
            }
            Animated.sequence([
                Animated.timing(borderAnim, { 
                    toValue: 1, 
                    duration: 200, 
                    useNativeDriver: false 
                }),
                Animated.delay(1000),
                Animated.timing(borderAnim, { 
                    toValue: 0, 
                    duration: 200, 
                    useNativeDriver: false 
                })
                ]).start(() => {
                setFeedback(null);
            });

            setWordsSeen(prev => prev + 1);
            setAnswer('');
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
            
            Keyboard.dismiss();
            return isCorrect;
        })
        .catch(error => {
            console.error('Error fetching words:', error);
        });
    };

    const panResponder = useRef(
      PanResponder.create({
          onMoveShouldSetPanResponder: (evt, gestureState) => {
              return Math.abs(gestureState.dy) > 20;
          },
          onPanResponderRelease: (evt, gestureState) => {
              const swipeThreshold = -50;
              if (gestureState.dy < swipeThreshold) {
                  goToNextWord();
              }
          },
      })
    ).current;

    const handleAddWord = () => {
        setShowModal(true);
    };

    const handleSubmitNewWord = () => {
        fetch('http://10.75.181.20:6060/insertWord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                word: newWord.trim()
            })
        }).then(() => {
            setNewWord('');
            setShowModal(false);
        });
    };

    const borderColor = feedback === 'correct' 
    ? borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', 'green']
    })
    : feedback === 'wrong'
    ? borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', 'red']
    })
    : 'transparent';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Animated.View style={[styles.container, { borderWidth: 5, borderColor: borderColor }]} {...panResponder.panHandlers}>
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowModal(false)}
                    >
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Add New Word</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Type new word..."
                                        value={newWord}
                                        onChangeText={setNewWord}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmitNewWord}
                                        autoFocus={true}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <TouchableOpacity style={styles.addWordButton} onPress={handleAddWord}>
                    <Text style={styles.addWordButtonText}>Add Word</Text>
                </TouchableOpacity>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>
                        {correctCount} / {wordsSeen}
                    </Text>
                </View>
                <Text style={styles.wordText}>{words[currentWordIndex]}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter the definition here..."
                    value={answer}
                    onChangeText={setAnswer}
                    returnKeyType="done"
                    onSubmitEditing={goToNextWord}
                />
                <StatusBar style="auto" />
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    wordText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        fontSize: 18,
    },
    addWordButton: {
        position: 'absolute',
        top: 50,
        left: 30,
    },
    addWordButtonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold'
    },
    scoreContainer: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalInput: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        fontSize: 16
    },
});
