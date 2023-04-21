import './css/ModePage.css'

function ModePage() {
    return (
    <div className="divModePage">
        <p className="modePageTitle">Select a Game Mode</p>
        <div className="normalGameMode">
            <p className="classicPong">Classic Pong</p>
        <div className="imgPlaceHolder"></div>
        </div>
        <div className="customGameMode">
            <p className="customPong">Custom Pong</p>
            <div className="imgPlaceHolder2"></div>
        </div>
    </div>
    );
}

export default ModePage;