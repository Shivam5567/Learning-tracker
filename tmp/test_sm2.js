const { calculateSM2, getRevisionLabel } = require('../server/utils/sm2');
const fs = require('fs');

const topic = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0
};

let output = '';
const log = (msg, ...args) => {
  output += msg + (args.length ? ' ' + JSON.stringify(args) : '') + '\n';
};

log('--- SM-2 LOGIC TEST ---');

// 1. First success (Q4)
let res = calculateSM2(topic, 4);
log('1st success (Q4):', res.interval, 'days, Reps:', res.repetitions);

// 2. Second success (Q5) - Should be 6 days
let res2 = calculateSM2(res, 5);
log('2nd success (Q5):', res2.interval, 'days, Reps:', res2.repetitions);

// 3. Third success (Q4) - Should scale by EF
let res3 = calculateSM2(res2, 4);
log('3rd success (Q4):', res3.interval, 'days, EF:', res3.easeFactor);

// 4. Quality 2 Second Chance
log('\n--- QUALITY 2 TEST ---');
let q2Res = calculateSM2(res3, 2);
log('Q2 Response:', q2Res.interval, 'days, Reps:', q2Res.repetitions);

// 5. EF Safety Limits
log('\n--- EF LIMITS TEST ---');
let lowEF = { easeFactor: 1.35, interval: 1, repetitions: 1 };
let resFloor = calculateSM2(lowEF, 0); // Big drop
log('EF Floor Check (Q0):', resFloor.easeFactor, '(Should be >= 1.3)');

// 6. Label Verification
log('\n--- LABEL TEST ---');
const now = new Date();
const pastDate = new Date(); pastDate.setDate(now.getDate() - 2);
const todayDate = new Date(); todayDate.setHours(0,0,0,0);
const futureDate = new Date(); futureDate.setDate(now.getDate() + 5);

log('Past Date Label:', getRevisionLabel(pastDate));
log('Today Date Label:', getRevisionLabel(todayDate));
log('In 5 days Label:', getRevisionLabel(futureDate));

// 7. Mastery Check
log('\n--- MASTERY TEST ---');
let masteryTopic = { easeFactor: 2.5, interval: 200, repetitions: 5 };
let resMastery = calculateSM2(masteryTopic, 5); // Interval should jump > 365
log('Mastery Check:', resMastery.interval, 'days, isMastered:', resMastery.isMastered);

fs.writeFileSync('c:\\Users\\shiva\\Documents\\test_copilot\\tmp\\test_sm2.log', output);
console.log('Test completed and logged to test_sm2.log');
