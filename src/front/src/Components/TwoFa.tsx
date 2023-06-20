import { Component, useState } from "react";
import axios from "axios";
import './css/TwoFa.css';

interface IProps {

}

interface IState {
	success: boolean,
}

class TwoFa extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			success: true,
		}
	}

	sendInput = async () => {
		const token = (document.querySelector('.input-2fa') as HTMLInputElement).value;
		if (token.length !== 6) {
			this.setState({ success: false })
			return;
		}
		const request = await axios.post("http://localhost:3333/2fa/verify",
			JSON.stringify({
				token: token,
				username: sessionStorage.getItem('username'),
				refreshToken: sessionStorage.getItem('refreshToken'),
				accessToken: sessionStorage.getItem('accessToken'),
			}),
			{ headers: { 'Content-Type': 'application/json' } });
		if (request.data.success === true) {
			sessionStorage.setItem('accessToken', request.data.accessToken);
			sessionStorage.setItem('refreshToken', request.data.refreshToken);
			window.location.href = 'http://localhost:3133/profile';
		}
		else {
			this.setState({ success: false });
			// @ts-ignore: Object is possibly 'null'.
			document.querySelector('.input-2fa').value = "";
		}
	}

	componentDidMount = async () => {
		const request = await axios.post("http://localhost:3333/2fa/get_qr",
			JSON.stringify({
				username: sessionStorage.getItem('username'),
				refreshToken: sessionStorage.getItem('refreshToken'),
				accessToken: sessionStorage.getItem('accessToken'),
			}),
			{ headers: { 'Content-Type': 'application/json' } });
		if (request.data.success === true) {
			// add qr code as background image url
			// @ts-ignore: Object is possibly 'null'.
			document.querySelector('.qr-div').style.backgroundImage = `url(${request.data.qrCode})`;
		}

	}

	render() {
		return (
			<div>
				<div className="qr-div"></div>
				{this.state.success === false ? <p className="error">Invalid 2FA code</p> : <p></p>}
				<input className="input-2fa" type="text" maxLength={6} />
				<button className="send-input" onClick={this.sendInput}>Validate 2FA</button>
			</div>
		)
	}
}

export default TwoFa;