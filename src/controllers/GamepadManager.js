class GamepadManager {
    constructor() {
        this.gamepads = {};
        this.deadzone = 0.15; // Ignore small stick movements
        this.buttonStates = {};
        this.previousButtonStates = {};
        this.isSupported = 'getGamepads' in navigator;
        
        // Controller mappings for different types
        this.controllerMappings = {
            // Xbox Controller (standard mapping)
            xbox: {
                buttons: {
                    A: 0,           // A button (boost)
                    B: 1,           // B button (cancel/back)
                    X: 2,           // X button (cashout)
                    Y: 3,           // Y button (weapon switch)
                    LB: 4,          // Left bumper (primary weapon)
                    RB: 5,          // Right bumper (secondary weapon)
                    LT: 6,          // Left trigger (sidearm)
                    RT: 7,          // Right trigger (shoot)
                    Back: 8,        // Back/Select button
                    Start: 9,       // Start/Menu button
                    LS: 10,         // Left stick click
                    RS: 11,         // Right stick click
                    DPadUp: 12,     // D-pad up
                    DPadDown: 13,   // D-pad down
                    DPadLeft: 14,   // D-pad left
                    DPadRight: 15   // D-pad right
                },
                axes: {
                    LeftStickX: 0,  // Left stick horizontal
                    LeftStickY: 1,  // Left stick vertical
                    RightStickX: 2, // Right stick horizontal
                    RightStickY: 3  // Right stick vertical
                }
            },
            // PlayStation Controller
            playstation: {
                buttons: {
                    Cross: 0,       // Cross button (boost)
                    Circle: 1,      // Circle button (cancel/back)
                    Square: 2,      // Square button (cashout)
                    Triangle: 3,    // Triangle button (weapon switch)
                    L1: 4,          // L1 (primary weapon)
                    R1: 5,          // R1 (secondary weapon)
                    L2: 6,          // L2 (sidearm)
                    R2: 7,          // R2 (shoot)
                    Share: 8,       // Share button
                    Options: 9,     // Options button
                    L3: 10,         // Left stick click
                    R3: 11,         // Right stick click
                    DPadUp: 12,     // D-pad up
                    DPadDown: 13,   // D-pad down
                    DPadLeft: 14,   // D-pad left
                    DPadRight: 15   // D-pad right
                },
                axes: {
                    LeftStickX: 0,  // Left stick horizontal
                    LeftStickY: 1,  // Left stick vertical
                    RightStickX: 2, // Right stick horizontal
                    RightStickY: 3  // Right stick vertical
                }
            }
        };
        
        this.callbacks = {
            onMove: null,
            onBoost: null,
            onShoot: null,
            onWeaponSwitch: null,
            onCashout: null,
            onSpectateNext: null
        };
        
        if (this.isSupported) {
            this.init();
        }
    }
    
    init() {
        // Listen for gamepad connection events
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.addGamepad(e.gamepad);
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected:', e.gamepad.id);
            this.removeGamepad(e.gamepad);
        });
        
        // Start polling for gamepad input
        this.startPolling();
    }
    
    addGamepad(gamepad) {
        const controllerType = this.detectControllerType(gamepad.id);

        this.gamepads[gamepad.index] = {
            gamepad: gamepad,
            type: controllerType,
            lastUpdate: Date.now()
        };

        // Initialize button states
        this.buttonStates[gamepad.index] = {};
        this.previousButtonStates[gamepad.index] = {};
    }
    
    removeGamepad(gamepad) {
        delete this.gamepads[gamepad.index];
        delete this.buttonStates[gamepad.index];
        delete this.previousButtonStates[gamepad.index];
    }
    
    detectControllerType(id) {
        const idLower = id.toLowerCase();
        if (idLower.includes('xbox') || idLower.includes('xinput')) {
            return 'xbox';
        } else if (idLower.includes('playstation') || idLower.includes('dualshock') || idLower.includes('dualsense')) {
            return 'playstation';
        }
        // Default to Xbox mapping for unknown controllers
        return 'xbox';
    }
    
    startPolling() {
        const poll = () => {
            this.update();
            requestAnimationFrame(poll);
        };
        poll();
    }
    
    update() {
        if (!this.isSupported) return;
        
        const gamepads = navigator.getGamepads();
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && this.gamepads[i]) {
                this.updateGamepad(gamepad);
            }
        }
    }
    
    updateGamepad(gamepad) {
        const controllerData = this.gamepads[gamepad.index];
        const mapping = this.controllerMappings[controllerData.type];
        
        // Store previous button states
        this.previousButtonStates[gamepad.index] = { ...this.buttonStates[gamepad.index] };
        
        // Update current button states
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this.buttonStates[gamepad.index][i] = gamepad.buttons[i].pressed;
        }
        
        // Handle movement (left stick)
        const leftX = gamepad.axes[mapping.axes.LeftStickX];
        const leftY = gamepad.axes[mapping.axes.LeftStickY];
        
        if (Math.abs(leftX) > this.deadzone || Math.abs(leftY) > this.deadzone) {
            if (this.callbacks.onMove) {
                this.callbacks.onMove(leftX, leftY);
            }
        }
        
        // Handle boost (A/Cross button)
        const boostButton = controllerData.type === 'xbox' ? mapping.buttons.A : mapping.buttons.Cross;
        if (this.isButtonPressed(gamepad.index, boostButton)) {
            if (this.callbacks.onBoost) {
                this.callbacks.onBoost(true);
            }
        } else if (this.isButtonReleased(gamepad.index, boostButton)) {
            if (this.callbacks.onBoost) {
                this.callbacks.onBoost(false);
            }
        }
        
        // Handle shooting (right trigger)
        const shootButton = mapping.buttons.RT || mapping.buttons.R2;
        if (this.isButtonJustPressed(gamepad.index, shootButton)) {
            if (this.callbacks.onShoot) {
                this.callbacks.onShoot();
            }
        }
        
        // Handle weapon switching
        if (this.isButtonJustPressed(gamepad.index, mapping.buttons.LB || mapping.buttons.L1)) {
            if (this.callbacks.onWeaponSwitch) {
                this.callbacks.onWeaponSwitch('primaryWeapon');
            }
        }
        
        if (this.isButtonJustPressed(gamepad.index, mapping.buttons.RB || mapping.buttons.R1)) {
            if (this.callbacks.onWeaponSwitch) {
                this.callbacks.onWeaponSwitch('secondaryWeapon');
            }
        }
        
        if (this.isButtonJustPressed(gamepad.index, mapping.buttons.LT || mapping.buttons.L2)) {
            if (this.callbacks.onWeaponSwitch) {
                this.callbacks.onWeaponSwitch('sidearm');
            }
        }
        
        // Handle cashout (X/Square button)
        const cashoutButton = mapping.buttons.X || mapping.buttons.Square;
        if (this.isButtonJustPressed(gamepad.index, cashoutButton)) {
            if (this.callbacks.onCashout) {
                this.callbacks.onCashout();
            }
        }
        
        // Handle spectate cycling (Y/Triangle button)
        const spectateButton = mapping.buttons.Y || mapping.buttons.Triangle;
        if (this.isButtonJustPressed(gamepad.index, spectateButton)) {
            if (this.callbacks.onSpectateNext) {
                this.callbacks.onSpectateNext();
            }
        }
    }
    
    isButtonPressed(gamepadIndex, buttonIndex) {
        return this.buttonStates[gamepadIndex] && this.buttonStates[gamepadIndex][buttonIndex];
    }
    
    isButtonJustPressed(gamepadIndex, buttonIndex) {
        const current = this.buttonStates[gamepadIndex] && this.buttonStates[gamepadIndex][buttonIndex];
        const previous = this.previousButtonStates[gamepadIndex] && this.previousButtonStates[gamepadIndex][buttonIndex];
        return current && !previous;
    }
    
    isButtonReleased(gamepadIndex, buttonIndex) {
        const current = this.buttonStates[gamepadIndex] && this.buttonStates[gamepadIndex][buttonIndex];
        const previous = this.previousButtonStates[gamepadIndex] && this.previousButtonStates[gamepadIndex][buttonIndex];
        return !current && previous;
    }
    
    setCallback(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }
    
    getConnectedControllers() {
        return Object.keys(this.gamepads).map(index => ({
            index: parseInt(index),
            type: this.gamepads[index].type,
            id: this.gamepads[index].gamepad.id
        }));
    }
    
    isControllerConnected() {
        return Object.keys(this.gamepads).length > 0;
    }
    
    destroy() {
        // Clean up event listeners and stop polling
        this.callbacks = {};
        this.gamepads = {};
        this.buttonStates = {};
        this.previousButtonStates = {};
    }
}

export default GamepadManager;
