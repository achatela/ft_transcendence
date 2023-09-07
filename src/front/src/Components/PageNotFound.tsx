import { Component } from "react";
import './css/PageNotFound.css'

interface IProps {

}

interface IState {
}


class PageNotFound extends Component<IProps, IState> {
    render() {
        return (
            <div>
                <h1 className="quatre-cent-quatre">404 Not Found</h1>
            </div >
        )
    }
}

export default PageNotFound;