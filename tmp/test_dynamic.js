const { calculateSM2 } = require('../server/utils/sm2');
const fs = require('fs');

let output = '--- DYNAMIC 2ND INTERVAL TEST ---\n';

const topic1 = { easeFactor: 2.5, interval: 1, repetitions: 1 };
const resQ5 = calculateSM2(topic1, 5);
output += `Q5 on 2nd rep: ${resQ5.interval} days (Should be 6)\n`;

const topic2 = { easeFactor: 2.5, interval: 1, repetitions: 1 };
const resQ4 = calculateSM2(topic2, 4);
output += `Q4 on 2nd rep: ${resQ4.interval} days (Should be 4)\n`;

const topic3 = { easeFactor: 2.5, interval: 1, repetitions: 1 };
const resQ3 = calculateSM2(topic3, 3);
output += `Q3 on 2nd rep: ${resQ3.interval} days (Should be 2)\n`;

fs.writeFileSync('c:\\Users\\shiva\\Documents\\test_copilot\\tmp\\test_dynamic.log', output);
