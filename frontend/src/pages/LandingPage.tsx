import React from 'react';
import { useNavigate } from 'react-router-dom';
import WebSocketComponent from '../components/Websocket';
import Footer from '../components/Footer'

const LandingPage = () => {
	const navigate = useNavigate();
	return (
		<>
		<div className="landing-page">
			<div className="landing-content">
				<div className="logo">
					<h1>SynthPiser</h1>
				</div>
				<p className="magic">
					Embrace the Melodic Magic Awaiting Your Command!
				</p>
				<button
					onClick={() => {
						navigate('/home');
					}}
					className="enter-btn"
				>
					Enter
				</button>
				<WebSocketComponent />
			</div>
		</div>
		<Footer />
		</>
	);
};

export default LandingPage;
