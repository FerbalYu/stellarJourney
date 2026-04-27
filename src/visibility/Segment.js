import Point from './Point.js';

/**
 * 线段类，用于阴影投射
 */
class Segment {
  constructor(p1, p2, obstacle = null) {
    this.p1 = p1 instanceof Point ? p1 : new Point(p1.x, p1.y);
    this.p2 = p2 instanceof Point ? p2 : new Point(p2.x, p2.y);
    this.obstacle = obstacle;
    this.uid = Segment.uid++;
  }

  static uid = 0;

  /**
   * 获取线段的方向向量
   */
  direction() {
    return this.p2.subtract(this.p1);
  }

  /**
   * 获取线段的长度
   */
  length() {
    return this.p1.distanceTo(this.p2);
  }

  /**
   * 获取线段的中点
   */
  midpoint() {
    return this.p1.interpolate(this.p2, 0.5);
  }

  /**
   * 获取线段的法向量（左手边）
   */
  normal() {
    return this.direction().normalize().perpendicular();
  }

  /**
   * 获取线段的角度（弧度）
   */
  angle() {
    return this.direction().angle();
  }

  /**
   * 计算点到线段的最近点
   */
  closestPointTo(point) {
    const v = this.direction();
    const w = point.subtract(this.p1);
    const c1 = w.dot(v);

    if (c1 <= 0) return this.p1.clone();

    const c2 = v.dot(v);
    if (c2 <= c1) return this.p2.clone();

    const t = c1 / c2;
    return this.p1.add(v.multiply(t));
  }

  /**
   * 计算点到线段的距离
   */
  distanceToPoint(point) {
    return point.distanceTo(this.closestPointTo(point));
  }

  /**
   * 检测点是否在线段上（考虑容差）
   */
  containsPoint(point, epsilon = 0.0001) {
    const d1 = point.distanceTo(this.p1);
    const d2 = point.distanceTo(this.p2);
    const len = this.length();
    return Math.abs(d1 + d2 - len) < epsilon;
  }

  /**
   * 获取线段的端点数组
   */
  getEndpoints() {
    return [this.p1, this.p2];
  }

  /**
   * 获取线段上均匀分布的采样点
   */
  samplePoints(count) {
    const points = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      points.push(this.p1.interpolate(this.p2, t));
    }
    return points;
  }

  /**
   * 检测点是否在线段的"左边"（基于法向量方向）
   */
  isPointOnLeftSide(point) {
    const v1 = this.direction();
    const v2 = point.subtract(this.p1);
    return v1.cross(v2) >= 0;
  }

  /**
   * 投影点到线段所在的直线
   */
  projectPoint(point) {
    const v = this.direction();
    const w = point.subtract(this.p1);
    const t = w.dot(v) / v.dot(v);
    return this.p1.add(v.multiply(t));
  }

  /**
   * 创建从某点能看到的最远点
   */
  extendFrom(origin, maxDistance = Infinity) {
    const dir = this.direction().normalize();
    const dist = Math.min(this.length(), maxDistance);
    return new Segment(origin, origin.add(dir.multiply(dist)), this.obstacle);
  }

  toString() {
    return `Segment(${this.p1.toString()} -> ${this.p2.toString()})`;
  }
}

export default Segment;
