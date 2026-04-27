/**
 * BSP树节点类 - 用于空间分割
 */
class BSPNode {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.left = null;
    this.right = null;
    this.room = null;
  }

  // 分割节点
  split(minSize, _maxRatio) {
    if (this.left !== null || this.right !== null) {
      return false; // 已经分割过
    }

    // 确定分割方向
    let splitH = Math.random() > 0.5;

    if (this.width > this.height && this.width / this.height >= 1.25) {
      splitH = false; // 水平分割
    } else if (this.height > this.width && this.height / this.width >= 1.25) {
      splitH = true; // 垂直分割
    }

    const max = (splitH ? this.height : this.width) - minSize;
    if (max <= minSize) {
      return false; // 无法分割
    }

    const split = Math.floor(Math.random() * (max - minSize)) + minSize;

    if (splitH) {
      this.left = new BSPNode(this.x, this.y, this.width, split);
      this.right = new BSPNode(this.x, this.y + split, this.width, this.height - split);
    } else {
      this.left = new BSPNode(this.x, this.y, split, this.height);
      this.right = new BSPNode(this.x + split, this.y, this.width - split, this.height);
    }

    return true;
  }

  // 递归分割
  recursiveSplit(depth, minSize) {
    if (depth === 0 || this.width < minSize * 2 || this.height < minSize * 2) {
      return;
    }

    if (this.split(minSize, 1.5)) {
      this.left.recursiveSplit(depth - 1, minSize);
      this.right.recursiveSplit(depth - 1, minSize);
    }
  }

  // 获取所有叶子节点
  getLeaves() {
    if (this.left === null && this.right === null) {
      return [this];
    }

    let leaves = [];
    if (this.left) {
      leaves = leaves.concat(this.left.getLeaves());
    }
    if (this.right) {
      leaves = leaves.concat(this.right.getLeaves());
    }
    return leaves;
  }

  // 获取包含此节点的最小区域
  getRect() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

export default BSPNode;
