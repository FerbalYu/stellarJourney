import Point from './Point.js';
import Segment from './Segment.js';

/**
 * 递归阴影投射算法
 * 基于 Recursive Shadowcasting 的可见性计算
 */
class ShadowCaster {
  constructor(config = {}) {
    this.viewRadius = config.viewRadius || 10;
    this.angularSteps = config.angularSteps || 360;
    this.shadowIterations = config.shadowIterations || 2;
    this.interpolationSamples = config.interpolationSamples || 8;
    this.minAngleDelta = config.minAngleDelta || 0.0001;
    this.tileSize = config.tileSize || 1;
  }

  /**
   * 计算从某个点出发的所有可见区域
   * @param {Point} origin - 观察者位置
   * @param {Segment[]} obstacles - 障碍物线段数组
   * @param {Function} isBlocked - 检测某点是否被阻挡的函数
   * @returns {Object} 包含可见线段和可见点的结果
   */
  computeVisibility(origin, obstacles = [], isBlocked = null) {
    const visibleSegments = [];
    const visiblePoints = new Set();
    const shadowRanges = [];

    // 收集所有关键角度（障碍物端点相对于观察者的角度）
    const angles = this.collectKeyAngles(origin, obstacles);

    // 对每个角度区间进行投射
    for (let i = 0; i < angles.length - 1; i++) {
      const angle1 = angles[i];
      const angle2 = angles[i + 1];
      const midAngle = (angle1 + angle2) / 2;

      // 在区间中点投射光线
      const rayPoint = Point.fromPolar(midAngle, this.viewRadius);
      const target = origin.add(rayPoint);

      // 检测光线是否碰到障碍物
      const intersection = this.castRay(origin, target, obstacles, isBlocked);

      if (intersection) {
        visibleSegments.push(new Segment(origin, intersection.point, intersection.obstacle));
        visiblePoints.add(JSON.stringify({ x: intersection.point.x, y: intersection.point.y }));

        if (intersection.obstacle) {
          shadowRanges.push({
            start: angle1,
            end: angle2,
            obstacle: intersection.obstacle,
          });
        }
      }
    }

    // 添加端点投射
    for (const angle of angles) {
      const rayPoint = Point.fromPolar(angle, this.viewRadius);
      const target = origin.add(rayPoint);
      const intersection = this.castRay(origin, target, obstacles, isBlocked);

      if (intersection) {
        visibleSegments.push(new Segment(origin, intersection.point, intersection.obstacle));
        visiblePoints.add(JSON.stringify({ x: intersection.point.x, y: intersection.point.y }));
      }
    }

    return {
      segments: visibleSegments,
      points: Array.from(visiblePoints)
        .map((s) => JSON.parse(s))
        .map((p) => new Point(p.x, p.y)),
      shadows: shadowRanges,
    };
  }

  /**
   * 收集所有关键角度
   */
  collectKeyAngles(origin, obstacles) {
    const angles = new Set();

    // 添加边界角度
    angles.add(0);
    angles.add(Math.PI * 2);

    // 从观察者位置到所有障碍物端点的角度
    for (const obstacle of obstacles) {
      const endpoints = obstacle.getEndpoints();
      for (const endpoint of endpoints) {
        const angle = origin.angleTo(endpoint);
        angles.add(angle);
        // 添加微小偏移以处理边缘情况
        angles.add(angle - this.minAngleDelta);
        angles.add(angle + this.minAngleDelta);
      }
    }

    // 排序角度
    return Array.from(angles).sort((a, b) => a - b);
  }

  /**
   * 投射单条光线，找到最近的障碍物交点
   */
  castRay(origin, target, obstacles, isBlocked) {
    let closestIntersection = null;
    let closestDistance = Infinity;

    for (const obstacle of obstacles) {
      const intersection = this.raySegmentIntersection(origin, target, obstacle);

      if (intersection && intersection.distance < closestDistance) {
        closestDistance = intersection.distance;
        closestIntersection = {
          point: intersection.point,
          obstacle: obstacle.obstacle,
          segment: obstacle,
        };
      }
    }

    // 检查 isBlocked 函数
    if (isBlocked && closestIntersection) {
      const blockedPoint = this.findFirstBlockingPoint(
        origin,
        closestIntersection.point,
        isBlocked
      );
      if (blockedPoint) {
        return {
          point: blockedPoint,
          obstacle: blockedPoint.obstacle,
        };
      }
    }

    return closestIntersection;
  }

  /**
   * 光线与线段求交
   */
  raySegmentIntersection(rayOrigin, rayEnd, segment) {
    const rayDir = rayEnd.subtract(rayOrigin);
    const segDir = segment.p2.subtract(segment.p1);

    const cross = rayDir.cross(segDir);

    // 平行检测
    if (Math.abs(cross) < 1e-10) return null;

    const diff = segment.p1.subtract(rayOrigin);
    const t = diff.cross(segDir) / cross;
    const u = diff.cross(rayDir) / cross;

    // t: 光线参数, u: 线段参数
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const point = rayOrigin.add(rayDir.multiply(t));
      return {
        point: point,
        t: t,
        u: u,
        distance: rayOrigin.distanceTo(point),
      };
    }

    return null;
  }

  /**
   * 找到第一个阻挡点
   */
  findFirstBlockingPoint(origin, target, isBlocked) {
    const dir = target.subtract(origin);
    const steps = Math.ceil(dir.magnitude() * this.interpolationSamples);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const point = origin.add(dir.multiply(t));

      if (isBlocked(point)) {
        return point;
      }
    }

    return null;
  }

  /**
   * 递归阴影投射 - 更精确的算法
   * 使用多重阴影计算
   */
  computeVisibilityRecursive(origin, obstacles = [], isBlocked = null) {
    const allVisiblePoints = new Set();
    const allVisibleSegments = [];

    // 初始投射
    let currentObstacles = [...obstacles];

    for (let iteration = 0; iteration < this.shadowIterations; iteration++) {
      const result = this.computeVisibility(origin, currentObstacles, isBlocked);

      // 收集可见点
      for (const point of result.points) {
        allVisiblePoints.add(`${point.x},${point.y}`);
      }

      // 收集可见线段
      allVisibleSegments.push(...result.segments);

      // 递归：为每个可见的障碍物端点创建新的投射
      const newObstacles = [];
      for (const pointStr of allVisiblePoints) {
        const [x, y] = pointStr.split(',').map(Number);
        const point = new Point(x, y);

        // 从这个点向其他障碍物投射
        for (const obstacle of obstacles) {
          if (!obstacle.getEndpoints().some((ep) => ep.distanceTo(point) < 0.1)) {
            // 检查是否在视线内
            const endpoints = obstacle.getEndpoints();
            for (const ep of endpoints) {
              const dist = point.distanceTo(ep);
              if (dist < this.viewRadius) {
                newObstacles.push(new Segment(point, ep, obstacle.obstacle));
              }
            }
          }
        }
      }

      currentObstacles = [...new Set([...currentObstacles, ...newObstacles])];
    }

    return {
      segments: allVisibleSegments,
      points: Array.from(allVisiblePoints).map((s) => {
        const [x, y] = s.split(',').map(Number);
        return new Point(x, y);
      }),
    };
  }

  /**
   * 使用扇形扫描计算可见区域
   */
  computeVisibilityFan(origin, obstacles = [], maxRadius = null) {
    const radius = maxRadius || this.viewRadius;
    const visiblePolygons = [];
    const allAngles = new Set([0, Math.PI * 2]);

    // 收集所有端点角度
    for (const obstacle of obstacles) {
      for (const endpoint of obstacle.getEndpoints()) {
        const angle = Math.atan2(endpoint.y - origin.y, endpoint.x - origin.x);
        allAngles.add(angle);
        allAngles.add(angle - 0.00001);
        allAngles.add(angle + 0.00001);
      }
    }

    const sortedAngles = Array.from(allAngles).sort((a, b) => a - b);

    // 对每个角度区间创建可见多边形
    for (let i = 0; i < sortedAngles.length - 1; i++) {
      const angle1 = sortedAngles[i];
      const angle2 = sortedAngles[i + 1];
      const midAngle = (angle1 + angle2) / 2;

      // 计算该扇形的边界
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const p1 = new Point(
        origin.x + Math.cos(angle1) * radius,
        origin.y + Math.sin(angle1) * radius
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const p2 = new Point(
        origin.x + Math.cos(angle2) * radius,
        origin.y + Math.sin(angle2) * radius
      );

      // 找到最近的障碍物
      const rayEnd = new Point(
        origin.x + Math.cos(midAngle) * radius,
        origin.y + Math.sin(midAngle) * radius
      );

      const intersection = this.castRay(origin, rayEnd, obstacles);
      const visibleRadius = intersection ? origin.distanceTo(intersection.point) : radius;

      // 创建扇形多边形
      const fanPoint = new Point(
        origin.x + Math.cos(midAngle) * visibleRadius,
        origin.y + Math.sin(midAngle) * visibleRadius
      );

      visiblePolygons.push({
        type: 'fan',
        origin: origin,
        angle1: angle1,
        angle2: angle2,
        radius: visibleRadius,
        center: fanPoint,
      });
    }

    return visiblePolygons;
  }
}

// 为 Point 添加 angleTo 方法
Point.prototype.angleTo = function (other) {
  return Math.atan2(other.y - this.y, other.x - this.x);
};

export default ShadowCaster;
