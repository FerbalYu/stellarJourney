/**
 * 房间类 - 定义单个房间
 */
class Room {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.doors = [];
    this.connected = false;
    this.type = 'normal'; // normal, treasure, boss, start, exit
  }

  // 获取房间中心点
  getCenter() {
    return {
      x: Math.floor(this.x + this.width / 2),
      y: Math.floor(this.y + this.height / 2),
    };
  }

  // 获取房间边界
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width - 1,
      top: this.y,
      bottom: this.y + this.height - 1,
    };
  }

  // 添加门
  addDoor(x, y, direction) {
    this.doors.push({ x, y, direction });
  }

  // 检查点是否在房间内
  contains(x, y) {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  }

  // 与另一个房间相交
  intersects(other) {
    const bounds = this.getBounds();
    const otherBounds = other.getBounds();
    return !(
      bounds.right < otherBounds.left ||
      bounds.left > otherBounds.right ||
      bounds.bottom < otherBounds.top ||
      bounds.top > otherBounds.bottom
    );
  }

  // 获取随机内部点
  getRandomPoint() {
    return {
      x: Math.floor(Math.random() * (this.width - 2)) + this.x + 1,
      y: Math.floor(Math.random() * (this.height - 2)) + this.y + 1,
    };
  }
}

export default Room;
