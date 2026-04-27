/**
 * 游戏主菜单 - 交互逻辑
 * 包含菜单导航、设置面板、模态框、提示消息等功能
 */

class GameMenu {
  constructor() {
    this.currentIndex = 0;
    this.menuItems = [];
    this.isSettingsOpen = false;
    this.isModalOpen = false;
    this.modalCallback = null;

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.setupKeyboardNavigation();
    this.setupMouseTracking();
    this.animateEntrance();
    console.log('🎮 游戏主菜单已初始化');
  }

  cacheElements() {
    // 菜单元素
    this.menuList = document.querySelector('.menu-list');
    this.menuItems = Array.from(document.querySelectorAll('.menu-item'));

    // 设置面板
    this.settingsPanel = document.getElementById('settingsPanel');
    this.musicSlider = document.getElementById('musicVolume');
    this.sfxSlider = document.getElementById('sfxVolume');
    this.fullscreenToggle = document.getElementById('fullscreenToggle');
    this.vsyncToggle = document.getElementById('vsyncToggle');

    // 模态框
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalMessage = document.getElementById('modalMessage');
    this.modalCancel = document.getElementById('modalCancel');
    this.modalConfirm = document.getElementById('modalConfirm');

    // 提示框容器
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // 菜单项点击事件
    this.menuItems.forEach((item, index) => {
      item.addEventListener('click', () => this.handleMenuClick(item, index));
      item.addEventListener('mouseenter', () => this.setActiveItem(index));
    });

    // 设置面板事件
    this.setupSettingsEvents();

    // 模态框事件
    this.modalCancel.addEventListener('click', () => this.closeModal());
    this.modalConfirm.addEventListener('click', () => this.confirmModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    // ESC键关闭面板/模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isModalOpen) {
          this.closeModal();
        } else if (this.isSettingsOpen) {
          this.closeSettings();
        }
      }
    });

    // 按钮事件代理
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.close;
        if (panel === 'settings') this.closeSettings();
      });
    });

    document.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleButtonAction(action);
      });
    });
  }

  setupSettingsEvents() {
    // 音量滑块
    const updateSliderValue = (slider, _display) => {
      const valueSpan = slider.parentElement.querySelector('.slider-value');
      if (valueSpan) {
        valueSpan.textContent = `${slider.value}%`;
      }
    };

    this.musicSlider?.addEventListener('input', () => updateSliderValue(this.musicSlider));
    this.sfxSlider?.addEventListener('input', () => updateSliderValue(this.sfxSlider));

    // 全屏切换
    this.fullscreenToggle?.addEventListener('click', () => {
      this.fullscreenToggle.classList.toggle('active');
      if (this.fullscreenToggle.classList.contains('active')) {
        this.requestFullscreen();
      } else {
        this.exitFullscreen();
      }
    });

    // 垂直同步切换
    this.vsyncToggle?.addEventListener('click', () => {
      this.vsyncToggle.classList.toggle('active');
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.isModalOpen || this.isSettingsOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.navigateUp();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (e.key.toLowerCase() === 's' && !this.isSettingsOpen) {
            // 如果不是按住Shift，可能触发商店快捷键
            if (!e.shiftKey) {
              // 暂时不处理，让快捷键处理
            } else {
              e.preventDefault();
              this.navigateDown();
            }
          } else {
            e.preventDefault();
            this.navigateDown();
          }
          break;
        case 'Enter':
          e.preventDefault();
          this.activateCurrentItem();
          break;
        case 'o':
        case 'O':
          e.preventDefault();
          this.openSettings();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          this.handleMenuClick(this.menuItems[5], 5); // 制作人员
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7': {
          const num = parseInt(e.key) - 1;
          if (this.menuItems[num]) {
            e.preventDefault();
            this.handleMenuClick(this.menuItems[num], num);
          }
          break;
        }
      }

      // 快捷键导航
      if (e.altKey) {
        // 特殊快捷键处理
      }
    });
  }

  navigateUp() {
    this.setActiveItem(this.currentIndex > 0 ? this.currentIndex - 1 : this.menuItems.length - 1);
    this.playSound('navigate');
  }

  navigateDown() {
    this.setActiveItem(this.currentIndex < this.menuItems.length - 1 ? this.currentIndex + 1 : 0);
    this.playSound('navigate');
  }

  setActiveItem(index) {
    this.currentIndex = index;
    this.menuItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    this.menuItems[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  activateCurrentItem() {
    this.handleMenuClick(this.menuItems[this.currentIndex], this.currentIndex);
  }

  handleMenuClick(item, _index) {
    const action = item.dataset.action;

    // 添加点击动画
    item.style.transform = 'scale(0.95)';
    setTimeout(() => {
      item.style.transform = '';
    }, 100);

    this.playSound('select');

    switch (action) {
      case 'start':
        this.showStartGameConfirm();
        break;
      case 'continue':
        this.showToast('正在加载存档...', 'success');
        this.simulateLoading(() => {
          this.showToast('存档加载完成！', 'success');
        });
        break;
      case 'shop':
        this.showToast('正在打开商店...', 'success');
        this.simulateLoading(() => {
          this.showToast('新商品上架中！', 'warning');
        });
        break;
      case 'achievements':
        this.showToast('成就系统已解锁 12/50', 'success');
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'credits':
        this.showCredits();
        break;
      case 'exit':
        this.showExitConfirm();
        break;
    }
  }

  handleButtonAction(action) {
    switch (action) {
      case 'resetSettings':
        this.resetSettings();
        break;
      case 'saveSettings':
        this.saveSettings();
        break;
    }
  }

  // 设置面板
  openSettings() {
    this.isSettingsOpen = true;
    this.settingsPanel.classList.add('active');
    this.playSound('open');
  }

  closeSettings() {
    this.isSettingsOpen = false;
    this.settingsPanel.classList.remove('active');
    this.playSound('close');
  }

  resetSettings() {
    this.musicSlider.value = 80;
    this.sfxSlider.value = 70;
    this.musicSlider.parentElement.querySelector('.slider-value').textContent = '80%';
    this.sfxSlider.parentElement.querySelector('.slider-value').textContent = '70%';
    this.fullscreenToggle.classList.remove('active');
    this.vsyncToggle.classList.add('active');
    this.showToast('设置已恢复默认值', 'success');
  }

  saveSettings() {
    const settings = {
      musicVolume: this.musicSlider.value,
      sfxVolume: this.sfxSlider.value,
      fullscreen: this.fullscreenToggle.classList.contains('active'),
      vsync: this.vsyncToggle.classList.contains('active'),
    };

    // 模拟保存设置
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    this.showToast('设置已保存', 'success');
    this.closeSettings();
  }

  // 全屏
  requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    this.showToast('已进入全屏模式', 'success');
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    this.showToast('已退出全屏模式', 'success');
  }

  // 模态框
  showModal(title, message, onConfirm = null) {
    this.modalTitle.textContent = title;
    this.modalMessage.textContent = message;
    this.modalCallback = onConfirm;
    this.isModalOpen = true;
    this.modalOverlay.classList.add('active');
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalOverlay.classList.remove('active');
    this.modalCallback = null;
  }

  confirmModal() {
    if (this.modalCallback) {
      this.modalCallback();
    }
    this.closeModal();
  }

  showStartGameConfirm() {
    this.showModal('开始新游戏', '确定要开始新游戏吗？当前进度将不会被保存。', () => {
      this.showToast('正在创建新游戏...', 'success');
      this.simulateLoading(() => {
        this.showToast('🎮 游戏开始！祝您游戏愉快！', 'success');
      });
    });
  }

  showExitConfirm() {
    this.showModal('退出游戏', '确定要退出游戏吗？', () => {
      this.showToast('正在退出...', 'warning');
      this.simulateLoading(() => {
        this.showToast('感谢游玩！', 'success');
        // 实际项目中这里会关闭游戏
      });
    });
    this.modalConfirm.classList.remove('btn-danger');
    this.modalConfirm.classList.add('btn-danger');
  }

  showCredits() {
    this.showToast('正在加载制作人员名单...', 'success');
  }

  // 提示消息
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

    this.toastContainer.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 鼠标追踪（用于菜单项光效）
  setupMouseTracking() {
    this.menuItems.forEach((item) => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        item.style.setProperty('--mouse-x', `${x}%`);
        item.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  // 进场动画
  animateEntrance() {
    this.menuItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';

      setTimeout(
        () => {
          item.style.transition = 'all 0.4s ease';
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        },
        100 + index * 80
      );
    });

    // 默认选中第一项
    setTimeout(() => {
      this.setActiveItem(0);
    }, 100);
  }

  // 加载模拟
  simulateLoading(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <span>加载中...</span>
        `;
    overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            z-index: 1000;
            color: white;
            font-size: 1rem;
        `;

    const spinner = overlay.querySelector('.loading-spinner');
    spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 3px solid rgba(99, 102, 241, 0.3);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

    const style = document.createElement('style');
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      if (callback) callback();
    }, 1500);
  }

  // 音效（模拟）
  playSound(_type) {
    // 实际项目中这里会播放音效
    // console.log(`🔊 播放音效: ${type}`);
  }

  // 获取当前设置
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem('gameSettings')) || this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      musicVolume: 80,
      sfxVolume: 70,
      fullscreen: false,
      vsync: true,
    };
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.gameMenu = new GameMenu();
});

// 导出
export default GameMenu;
