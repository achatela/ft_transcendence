import './css/ModePage.css'

function ModePage() {
    return (
    <div className="divModePage">
        <p class="modePageTitle">Select a Game Mode</p>
        <div class="normalGameMode">
            <p class="classicPong">Classic Pong</p>
        <div class="imgPlaceHolder"></div>
        </div>
        <div class="customGameMode">
            <p class="customPong">Custom Pong</p>
            <div class="imgPlaceHolder2"></div>
        </div>
    </div>
    );
}

export default ModePage;