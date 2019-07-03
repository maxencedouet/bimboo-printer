const moovingSpeed = 1000;
const fs = require('fs');

function svg2gcode(svg) {
    const elements = svg.split('>');
    let result = addBrush(elements);
    result += `X${0} Y${0} Z${0} F${moovingSpeed}\n`;
    fs.writeFile('tmp/output.gcode', result, () => {});
}

function addBrush(elements) {
    const power = 161;
    const scaleX = 0.18;
    const scaleY = 0.25;
    const toolingSpeed = 70;
    const translateX = 1;
    const translateY = 10;
    const translateZ = 5;

    return process(elements, power, scaleX, scaleY, translateX, translateY, translateZ, toolingSpeed, moovingSpeed)
}

function addBox() {
    const power = 150;
    const scaleX = 0.18;
    const scaleY = 0.25;
    const translateX = 46;
    const translateY = -11;
    const translateZ = 12;
    const toolingSpeed = 90;

    process(power, scaleX, scaleY, translateX, translateY, translateZ, toolingSpeed, moovingSpeed);
}

function process(elements, power, scaleX, scaleY, translateX, translateY, translateZ, toolingSpeed, moovingSpeed) {
    let result = ''
    result += `G90\nG1 X${-15 + translateX} Y0 Z${translateZ} F${moovingSpeed}\nS${power}\nZ-0.2\nG4 M03\n P3\nM05\nX${0 + translateX}\n`;

    const paths = elements
        .filter((x)=>x.includes('path'))
        .forEach(x=>{
            result += getGcode(x, scaleX, scaleY, translateX, translateY, toolingSpeed, moovingSpeed);
        })
    result += `M05\n`;

    return result;
}


function getGcode(str, scaleX, scaleY, translateX, translateY, toolingSpeed, moovingSpeed) {
    const translate = /translate[(](.*?)[)]/g.exec(str) ? /translate[(](.*?)[)]/g.exec(str)[1].split(',') : ['0','0'];
    const path = /d=["](.*?)["]/g.exec(str)[1];
    let result = '';

    path.split(/(?=M|L)(.*?)(?=L)/g)
    .filter(x => x !== '')
    .forEach(x => {
        const array = x.split(' ');

        if(array[0] === 'M') {
            const x = - (parseFloat(array[2]) + parseFloat(translate[1]) )* scaleY + translateX;
            const y = ( parseFloat(array[1]) + parseFloat(translate[0]) ) * scaleX + translateY;
            result += `M05\nG1 X${x} Y${y} F${moovingSpeed}\nZ-0.2\n`;
        } else if (array[0] === 'L') {
            const x = - (parseFloat(array[2]) + parseFloat(translate[1]) ) * scaleY + translateX;
            const y = (parseFloat(array[1]) + parseFloat(translate[0]) ) * scaleX + translateY;
            result += `M03\nX${x} Y${y} F${toolingSpeed}\n`;
        }
    });

    return result
}

module.exports = svg2gcode;
