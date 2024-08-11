import './App.css';
import React from 'react';

class InsertPage extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			input1: '',
			input2: ''
		};
	}

	handleInputChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	handleSubmit = () => {
		const { input1, input2 } = this.state;

		const data = {
			'word': input1,
			'definition': input2
		};
	
		fetch('http://127.0.0.1:6060/insert', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
		.then(response => response.json())
		.catch((error) => { console.error('Error:', error); });
	}

  	render() {
		return (
			<div>
				<div>Hello World1</div>
				<input
					type="text"
					name="input1"
					value={this.state.input1}
					onChange={this.handleInputChange}
					placeholder="Input 1"
				/>
				<input
					type="text"
					name="input2"
					value={this.state.input2}
					onChange={this.handleInputChange}
					placeholder="Input 2"
				/>
				<button onClick={this.handleSubmit}>Submit</button>
			</div>
		);
	}
}

export default InsertPage;
