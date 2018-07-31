const dataController = (function() {
    // Returns an obj with current seconds, mins, hours and a name to identify them later
    const newDate = function() {
        const date = new Date();

        return {
            sec: {
                name: "sec",
                amount: date.getSeconds()
            },
            min: {
                name: "min",
                amount: date.getMinutes()
            },
            hour: {
                name: "hour",
                amount: date.getHours()
            }
        };
    };

    return {
        // Makes the newDate expression public
        time: function() {
            return newDate();
        }
    };
})();

const uiController = (function() {
    // Obj that contains the references to the clock hands in the DOM
    const domElements = {
        clock: {
            sec: document.getElementById("sec"),
            min: document.getElementById("min"),
            hour: document.getElementById("hour")
        },
        buttons: document.getElementsByTagName("button"),
        clockMain: document.getElementById("clock-main"),
        colons: document.querySelectorAll(".colon")
    };

    // Receives the time unit (sec, min or hour) and returns the corresponding degrees
    const movement = function(el) {
        let degrees = 0;
        if (el.name !== "hour") {
            degrees = el.amount * 6;
        } else {
            degrees = el.amount * 30;
        }
        return degrees;
    };

    // Receives the time unit (sec, min or hour) and returns the corresponding degrees
    const newHeight = function(el) {
        let height = 0;
        if (el.name !== "hour") {
            height = el.amount * 1.7;
        } else {
            height = el.amount * 4.2;
        }
        return height;
    };

    return {
        // Makes the dom elements public
        getDOMElements: function() {
            return domElements;
        },

        // Receives an object with the references to the current time, and returns for each the corresponding amount of degrees
        getDegrees: function(time) {
            const degObj = {};
            for (key in time) {
                degObj[key] = movement(time[key]);
            }
            return degObj;
        },

        // Receives the clock hands object and the degrees object, and applies the corresponding CSS transformation to move it on the display
        rotation: function(domElements, degrees) {
            for (let key in domElements) {
                if (degrees[key] === 0) {
                    domElements[key].style.transition = "none";
                } else {
                    domElements[key].style.transition = "";
                }
                domElements[key].style.transform = `rotate(${degrees[key]}deg)`;
                domElements[key].style.height = "";
            }
        },

        // Receives an object with the references to the current time, and returns for each the corresponding new height
        getHeight: function(time) {
            const degObj = {};
            for (key in time) {
                degObj[key] = newHeight(time[key]);
            }
            return degObj;
        },

        // Receives the clock hands object and the degrees object, and applies the corresponding CSS transformation to move it on the display
        stretcher: function(domElements, degrees) {
            for (let key in domElements) {
                domElements[key].style.height = `${degrees[key]}%`;
            }
        },

        // Changes the clock's appearance by getting its current class, removing  it and adding the new one based on the data type of the clicked button
        styleChanger: function(event, dom) {
            const dataset = event.target.dataset.type;
            dom.clockMain.dataset.type = `${dataset}`;
            dom.clockMain.className = `clock-${dataset}`;
            for (let key in dom.clock) {
                dom.clock[key].classList = "";
                dom.clock[key].classList.add(`hand-${dataset}`);
                dom.clock[key].classList.add(`${key}-${dataset}`);
                dom.clock[key].style.transform = "";
            }
        },

        numberUpdater: function(domElements, time) {
            for (let key in domElements) {
                domElements[key].textContent = time[key].amount;
            }
        },

        prepareUi: function(dataset, domElements) {
            if (dataset !== "digits") {
                domElements.colons.forEach(el => el.style.display = "none");
                for (let key in domElements.clock) {
                    domElements.clock[key].textContent = "";
                }
            } else {
                domElements.colons.forEach(el => el.style.display = "flex");
                for (let key in domElements.clock) {
                    domElements.clock[key].style.height = "";
                }
            }
        }
    };
})();

const generalController = (function(dataCtrl, uiCtrl) {
    const DOM = uiCtrl.getDOMElements();
    let intervalID;

    const setupEventListeners = function() {
        // Buttons to select clock style
        Array.from(DOM.buttons).forEach(el => {
            el.addEventListener("click", function(e) {
                // When clicked, the buttons's data-type is passed on to be applied to the UI elements
                uiCtrl.styleChanger(e, DOM);
                typeChecker();
            });
        });
    };

    // Applies different movements to different types of clocks
    function typeChecker() {
        clearInterval(intervalID);

        intervalID = setInterval(() => {
            const now = dataCtrl.time();
            const dataset = DOM.clockMain.dataset.type;
            uiCtrl.prepareUi(dataset, DOM);

            if (dataset === "round") {
                const deg = uiCtrl.getDegrees(now);
                uiCtrl.rotation(DOM.clock, deg);
            } else if (dataset === "bars") {
                const deg = uiCtrl.getHeight(now);
                uiCtrl.stretcher(DOM.clock, deg);
            } else if (dataset === "digits") {
                uiCtrl.numberUpdater(DOM.clock, now);
            }
        }, 1000);
    }

    return {
        init: function() {
            setupEventListeners();
            typeChecker();
        }
    };
})(dataController, uiController);

generalController.init();
