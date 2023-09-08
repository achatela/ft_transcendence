import { Component, useState } from "react";
import axios from "axios";
import './css/TwoFa.css';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

interface IProps {

}

interface IState {
	success: boolean,
	qrCode: string,
}

class TwoFa extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			success: true,
			qrCode: "",
		}
	}

	sendInput = async () => {
		const token = (document.querySelector('.input-2fa') as HTMLInputElement).value;
		if (token.length !== 6) {
			this.setState({ success: false })
			return;
		}
		try {
			const request = await axios.post('http://' + domain + ':3333/2fa/verify',
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
				window.location.href = '/profile';
			}
			else {
				this.setState({ success: false });
				// @ts-ignore: Object is possibly 'null'.
				document.querySelector('.input-2fa').value = "";
			}
		}
		catch (err) {
			console.log(err);
		}
	}

	async componentDidMount(): Promise<void> {
		try {
			const request = await axios.post('http://' + domain + ':3333/2fa/get_qr_if_not_enabled/',
				JSON.stringify({
					username: sessionStorage.getItem('username'),
					refreshToken: sessionStorage.getItem('refreshToken'),
					accessToken: sessionStorage.getItem('accessToken'),
				}),
				{ headers: { 'Content-Type': 'application/json' } });
			if (request.data.success === true) {
				console.log(request.data.qrCode)
				this.setState({ qrCode: request.data.qrCode });
			}
			else {
			}
		}
		catch (err) {
			console.log(err);
		}
	}

	render() {
		return (
			<div>
				{this.state.qrCode != "" ?
					<div className="qr-code" style={{ backgroundImage: `url(${this.state.qrCode})` }}></div> : null}
				{this.state.success === false ? <p className="error">Invalid 2FA code</p> : <p></p>}
				<input onKeyUp={(e) => { if (e.key === 'Enter') { this.sendInput() } }} className="input-2fa" type="text" maxLength={6} />
				<button className="send-input" onClick={this.sendInput}>Validate 2FA</button>
			</div>
		)
	}
}

export default TwoFa;