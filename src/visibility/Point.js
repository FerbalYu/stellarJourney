/**
 * 二维点类
 */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static fromPolar(angle, radius) {
    return new Point(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  clone() {
    return new Point(this.x, this.y);
  }

  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  multiply(scalar) {
    return new Point(this.x * scalar, this.y * scalar);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Point(0, 0);
    return new Point(this.x / mag, this.y / mag);
  }

  distanceTo(other) {
    return this.subtract(other).magnitude();
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  perpendicular() {
    return new Point(-this.y, this.x);
  }

  equals(other, epsilon = 0.0001) {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  interpolate(other, t) {
    return new Point(this.x + (other.x - this.x) * t, this.y + (other.y - this.y) * t);
  }

  toString() {
    return `Point(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}

export default Point;
