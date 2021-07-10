"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishTiming = exports.mark = void 0;
const perf_hooks_1 = require("perf_hooks");
function mark(name) {
    perf_hooks_1.performance.mark(name);
}
exports.mark = mark;
function finishTiming() {
    const periods = ['construct', 'prompting', 'writing', 'end'];
    periods.forEach(period => perf_hooks_1.performance.measure(`${period}Time`, `${period}Start`, `${period}End`));
    perf_hooks_1.performance.measure(`constructToPrompting`, `constructEnd`, `promptingStart`);
    perf_hooks_1.performance.measure(`promptingToWriting`, `promptingEnd`, `writingStart`);
    perf_hooks_1.performance.measure(`writingToEnd`, `writingEnd`, `endStart`);
    perf_hooks_1.performance.measure(`totalGenerator`, `constructStart`, `endEnd`);
    // const obs = new PerformanceObserver(items => {
    //   console.log(
    //     items
    //       .getEntries()
    //       .map(entry => `${entry.name}: ${entry.duration}`)
    //       .join('\n'),
    //   );
    // });
    // obs.observe({ entryTypes: ['mark', 'measure'], buffered: true });
    // performance.clearMarks();
}
exports.finishTiming = finishTiming;
//# sourceMappingURL=timer.js.map