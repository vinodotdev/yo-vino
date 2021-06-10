import { performance } from 'perf_hooks';

export function mark(name: string): void {
  performance.mark(name);
}

export function finishTiming(): void {
  const periods = ['construct', 'prompting', 'writing', 'end'];
  periods.forEach(period => performance.measure(`${period}Time`, `${period}Start`, `${period}End`));
  performance.measure(`constructToPrompting`, `constructEnd`, `promptingStart`);
  performance.measure(`promptingToWriting`, `promptingEnd`, `writingStart`);
  performance.measure(`writingToEnd`, `writingEnd`, `endStart`);
  performance.measure(`totalGenerator`, `constructStart`, `endEnd`);
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
