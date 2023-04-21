System.register("AddBallButton", ["react"], function (exports_1, context_1) {
    "use strict";
    var react_1;
    var __moduleName = context_1 && context_1.id;
    function AddBallButton(_a) {
        var onAddBall = _a.onAddBall, loginDiv = _a.loginDiv, speed = _a.speed;
        return (<button className="addBallButton" type="button" onClick={onAddBall}>
      Add Ball
    </button>);
    }
    exports_1("default", AddBallButton);
    return {
        setters: [
            function (react_1_1) {
                react_1 = react_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=tsc.js.map