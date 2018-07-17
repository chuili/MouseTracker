/*******************************************************************************************
 * Assumption:
 * 1. Speed calculation is based on the distance between coordinates mouse point A and
 *    coordinates mouse point B in linear divided by miliseconds
 * 2. Cumulate revolutions calculation is based on the first entry point. Once anticlockwise
 *    rotation is detected, the rovolutions will not be counted.
 *
 *******************************************************************************************
 */

var timestamp = null;
var centerPoint = {x: null, y: null};
var prevPoint = {mouseX: null, mouseY: null, circumX: null, circumY: null, angleDegree: null};
var cumulate = 0;
var speed = 0;
var anticlockwiseAngleDeg = 0;
var flag = false;

setInterval(resetSpeed, 100);

document.getElementById('movementBoundary').onmousemove = calculate;

function calculate(mouseEvent) {
    // Init timestamp and mouse point detection
    if (timestamp == null) {
        timestamp = Date.now();
        prevPoint.mouseX = mouseEvent.clientX;
        prevPoint.mouseY = mouseEvent.clientY;
        getCenterPoint();
        var initPointArr = getCircumPointAndAngle(prevPoint.mouseX, prevPoint.mouseY);
        prevPoint.circumX = initPointArr.x;
        prevPoint.circumY = initPointArr.y;
        prevPoint.angleDegree = initPointArr.angle;
        return;
    }

    // Get current mouse point
    var currPoint = {mouseX: null, mouseY: null, circumX: null, circumY: null, angleDegree: null};
    var now = Date.now();
    currPoint.mouseX = mouseEvent.clientX;
    currPoint.mouseY = mouseEvent.clientY;
    var currPointArr = getCircumPointAndAngle(currPoint.mouseX, currPoint.mouseY);
    currPoint.circumX = currPointArr.x;
    currPoint.circumY = currPointArr.y;
    currPoint.angleDegree = currPointArr.angle;
    
    if (currPoint.angleDegree > prevPoint.angleDegree) {
        if ((currPoint.angleDegree - prevPoint.angleDegree) < 20) {
            // Clockwise
            if (!flag) {
                cumulate = cumulate + currPoint.angleDegree - prevPoint.angleDegree - anticlockwiseAngleDeg;
                anticlockwiseAngleDeg = 0;
            }
            
            var diffX = currPoint.mouseX - prevPoint.mouseX;
            var diffY = currPoint.mouseY - prevPoint.mouseY;
            var distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
            var time = now - timestamp;
            speed = distance/time;
        } else {
            // False positive: Special anticlockwise use case when passing 0°/360°
            flag = true;
            var moveAngle = 360 - currPoint.angleDegree + prevPoint.angleDegree;
            anticlockwiseAngleDeg = (anticlockwiseAngleDeg + moveAngle) % 360;
            if ((cumulate % 360) < anticlockwiseAngleDeg) {
                anticlockwiseAngleDeg = cumulate % 360;
            }
        }
    } else {
        if ((currPoint.angleDegree < 10) && (prevPoint.angleDegree > 350)) {
            // Special clockwise use case when passing 0°/360°
            if (!flag) {
                cumulate = cumulate + 360 - prevPoint.angleDegree + currPoint.angleDegree;
            } else {
                flag = false;
            }
        } else {
            // Anticlockwise
            flag = true;
            var moveAngle = prevPoint.angleDegree - currPoint.angleDegree;
            anticlockwiseAngleDeg = (anticlockwiseAngleDeg + moveAngle) % 360;
            if ((cumulate % 360) < anticlockwiseAngleDeg) {
                anticlockwiseAngleDeg = cumulate % 360;
            }
            speed = 0.00;
        }
    }
    
    document.getElementById('cumulate').innerHTML = (cumulate/360).toFixed(2); //Number(Math.round(cumulate/360+'e2')+'e-2');
    document.getElementById('speed').innerHTML = speed.toFixed(2); //Number(Math.round(speed+'e2')+'e-2');
    
    // Set current point to previous point and timestamp
    timestamp = now;
    prevPoint = currPoint;
}

/**
 * Get the coordinates of center point. It shall be called at only once
 * during the initialization of timestamp and mouse point detection.
 * It shall be called before the call of getCircumPointAndAngle() API.
 */
function getCenterPoint() {
    /* Calculate center point */
    var cPoint_offsetHeight = document.getElementById('centerPoint').offsetHeight;
    var cPoint_offsetWidth = document.getElementById('centerPoint').offsetWidth;
    var cPoint_offsetTop = document.getElementById('centerPoint').offsetTop;
    var cPoint_offsetLeft = document.getElementById('centerPoint').offsetLeft;
    
    centerPoint.x = cPoint_offsetLeft + (cPoint_offsetWidth / 2);
    centerPoint.y = cPoint_offsetTop + (cPoint_offsetHeight / 2);
}

/**
 * Get the point and angle (in degree) on circumference of circle
 *
 * @param x   coordinate-X of the mouse point
 * @param y   coordinate-Y of the mouse point
 * @return    an array
 *                index 0: coordinate-X of the point circumference of a circle
 *                index 1: coordinate-Y
 *                index 2: angle of the point (in degree)
 */
function getCircumPointAndAngle(x, y) {    
    // Get angle between mouse point and center point
    var deltaX = centerPoint.x - x;
    var deltaY = centerPoint.y - y;
    
    var angleRad = Math.atan2(deltaY, deltaX);
    var angleDeg = angleRad * 180 / Math.PI;
    
    if (angleDeg < 90) {
        angleDeg += 270;
    } else if (angleDeg >= 90) {
        angleDeg = angleDeg - 90;
    }    
    
    var accX = centerPoint.x + 10 * Math.cos(angleRad);
    var accY = centerPoint.y + 10 * Math.sin(angleRad);
    var circumPoint = {x: accX, y: accY, angle: angleDeg};
    
    return circumPoint;
}

/**
 * Write speed to 0.00
 */
function resetSpeed() {
    document.getElementById("speed").innerHTML = "0.00";
}
