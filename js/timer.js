
class PomodoroTimer {
    constructor() {
        // Default timer durations in mins)
        this.settings = {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            longBreakInterval: 4
        };

        this.loadSettings();

        // timer state
        this.timeRemaining = this.settings.pomodoro * 60;
        this.totalTime = this.settings.pomodoro * 60;
        this.isRunning = false;
        this.currentMode = 'pomodoro';
        this.pomodorosCompleted = 0;
        this.intervalId = null;

        // DOM elements
        this.timeDisplay = document.querySelector('.timer-hero__time');
        this.modeButtons = document.querySelectorAll('[data-timer-mode]');
        this.playBtn = document.querySelector('.timer-hero__play');
        this.pauseBtn = document.querySelector('.timer-hero__pause');
        this.resetBtn = document.querySelector('.timer-hero__reset');
        this.settingsBtn = document.querySelector('.timer-hero__settings');
        this.modal = document.querySelector('.timer-settings-modal');
        this.modalClose = document.querySelector('.timer-settings-modal__close');
        this.settingsForm = document.querySelector('.timer-settings-form');

        // Progress circle
        this.progressCircle = document.querySelector('.timer-hero__progress-fill');
        this.circleRadius = 180; 
        this.circumference = 2 * Math.PI * this.circleRadius;

        this.init();
    }

    init() {
      
        if (this.progressCircle) {
            this.progressCircle.style.strokeDasharray = this.circumference;
            this.progressCircle.style.strokeDashoffset = 0;
        }

        
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.timerMode;
                this.switchMode(mode);
            });
        });

        this.playBtn?.addEventListener('click', () => this.start());
        this.pauseBtn?.addEventListener('click', () => this.pause());
        this.resetBtn?.addEventListener('click', () => this.reset());
        this.settingsBtn?.addEventListener('click', () => this.openSettings());
        this.modalClose?.addEventListener('click', () => this.closeSettings());
        
       
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeSettings();
            }
        });

      
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeSettings();
            }
        });

        
        this.settingsForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Update initial display
        this.updateDisplay();
        this.updateProgressCircle();
        this.populateSettingsForm();
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        
       
        this.playBtn?.classList.add('hidden');
        this.pauseBtn?.classList.remove('hidden');

       
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        this.announceToScreenReader(`Timer started. ${this.formatTime(this.timeRemaining)} remaining`);
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        
    
        this.playBtn?.classList.remove('hidden');
        this.pauseBtn?.classList.add('hidden');

        clearInterval(this.intervalId);
        this.intervalId = null;

        this.announceToScreenReader('Timer paused');
    }

    reset() {
        this.pause();
        
        const durations = {
            pomodoro: this.settings.pomodoro * 60,
            shortBreak: this.settings.shortBreak * 60,
            longBreak: this.settings.longBreak * 60
        };
        
        this.timeRemaining = durations[this.currentMode];
        this.totalTime = durations[this.currentMode];
        
        this.updateDisplay();
        this.updateProgressCircle();

        this.announceToScreenReader(`Timer reset to ${this.formatTime(this.timeRemaining)}`);
    }

    tick() {
        this.timeRemaining--;

        if (this.timeRemaining <= 0) {
            this.complete();
            return;
        }

        this.updateDisplay();
        this.updateProgressCircle();
    }

    complete() {
        this.pause();
        this.playNotification();

        if (this.currentMode === 'pomodoro') {
            this.pomodorosCompleted++;
            
            // determine next break type
            const nextMode = (this.pomodorosCompleted % this.settings.longBreakInterval === 0) 
                ? 'longBreak' 
                : 'shortBreak';
            
            this.switchMode(nextMode);
            
            if (this.settings.autoStartBreaks) {
                setTimeout(() => this.start(), 1000);
            }
        } else {
            this.switchMode('pomodoro');
            
            if (this.settings.autoStartPomodoros) {
                setTimeout(() => this.start(), 1000);
            }
        }

        this.announceToScreenReader(`Session complete! Starting ${this.getModeLabel(this.currentMode)}`);
    }

    switchMode(mode) {
        this.pause();
        
        const durations = {
            pomodoro: this.settings.pomodoro * 60,
            shortBreak: this.settings.shortBreak * 60,
            longBreak: this.settings.longBreak * 60
        };

        this.currentMode = mode;
        this.totalTime = durations[mode];
        this.timeRemaining = durations[mode];

       
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timerMode === mode);
        });

        this.updateDisplay();
        this.updateProgressCircle();
    }

    updateDisplay() {
        if (this.timeDisplay) {
            this.timeDisplay.textContent = this.formatTime(this.timeRemaining);
        }
    }

    updateProgressCircle() {
        if (!this.progressCircle) return;
        
        const progress = (this.totalTime - this.timeRemaining) / this.totalTime;
        const offset = this.circumference * (1 - progress);
        this.progressCircle.style.strokeDashoffset = offset;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getModeLabel(mode) {
        const labels = {
            pomodoro: 'Pomodoro',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };
        return labels[mode] || 'Pomodoro';
    }

 
    openSettings() {
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    populateSettingsForm() {
        if (!this.settingsForm) return;

        const inputs = {
            pomodoro: this.settingsForm.querySelector('#setting-pomodoro'),
            shortBreak: this.settingsForm.querySelector('#setting-short-break'),
            longBreak: this.settingsForm.querySelector('#setting-long-break'),
            longBreakInterval: this.settingsForm.querySelector('#setting-long-break-interval'),
            autoStartBreaks: this.settingsForm.querySelector('#setting-auto-breaks'),
            autoStartPomodoros: this.settingsForm.querySelector('#setting-auto-pomodoros')
        };

        if (inputs.pomodoro) inputs.pomodoro.value = this.settings.pomodoro;
        if (inputs.shortBreak) inputs.shortBreak.value = this.settings.shortBreak;
        if (inputs.longBreak) inputs.longBreak.value = this.settings.longBreak;
        if (inputs.longBreakInterval) inputs.longBreakInterval.value = this.settings.longBreakInterval;
        if (inputs.autoStartBreaks) inputs.autoStartBreaks.checked = this.settings.autoStartBreaks;
        if (inputs.autoStartPomodoros) inputs.autoStartPomodoros.checked = this.settings.autoStartPomodoros;
    }

    saveSettings() {
        if (!this.settingsForm) return;

        const formData = new FormData(this.settingsForm);
        
        this.settings = {
            pomodoro: parseInt(formData.get('pomodoro')) || 25,
            shortBreak: parseInt(formData.get('shortBreak')) || 5,
            longBreak: parseInt(formData.get('longBreak')) || 15,
            longBreakInterval: parseInt(formData.get('longBreakInterval')) || 4,
            autoStartBreaks: formData.get('autoStartBreaks') === 'on',
            autoStartPomodoros: formData.get('autoStartPomodoros') === 'on'
        };

        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));

        
        this.reset();
        
        this.closeSettings();
        this.announceToScreenReader('Settings saved');
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load settings');
            }
        }
    }

    playNotification() {
        // need to find  soundddd
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Audio notification not supported');
        }

        // browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('FlowState Timer', {
                body: `${this.getModeLabel(this.currentMode)} complete!`,
                icon: '/assets/faviconnn.svg'
            });
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    static requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// init timer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
   
    document.addEventListener('click', () => {
        PomodoroTimer.requestNotificationPermission();
    }, { once: true });
});