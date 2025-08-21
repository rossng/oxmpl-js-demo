export class CircularGoal {
  private target: number[];
  private radius: number;

  constructor(x: number, y: number, radius: number) {
    this.target = [x, y];
    this.radius = radius;
  }

  isSatisfied = (state: Float64Array | number[]): boolean => {
    const dx = state[0] - this.target[0];
    const dy = state[1] - this.target[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius;
  };

  distanceToGoal = (state: Float64Array | number[]): number => {
    const dx = state[0] - this.target[0];
    const dy = state[1] - this.target[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, distance - this.radius);
  };

  sampleGoal = (): Float64Array => {
    const angle = Math.random() * 2 * Math.PI;
    const radius = this.radius * Math.sqrt(Math.random());

    const x = this.target[0] + radius * Math.cos(angle);
    const y = this.target[1] + radius * Math.sin(angle);
    return new Float64Array([x, y]);
  };
}