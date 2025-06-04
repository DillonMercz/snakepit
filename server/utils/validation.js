/**
 * Validation utilities for server-side input validation
 */

/**
 * Validate player input data
 * @param {Object} data - Player data to validate
 * @returns {boolean} - Whether data is valid
 */
function validatePlayerInput(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Validate username
  if (!data.username || typeof data.username !== 'string') {
    return false;
  }
  
  if (data.username.length < 1 || data.username.length > 20) {
    return false;
  }

  // Validate game mode
  if (!data.gameMode || !['classic', 'warfare'].includes(data.gameMode)) {
    return false;
  }

  // Validate wager
  if (data.wager !== undefined) {
    if (typeof data.wager !== 'number' || data.wager < 10 || data.wager > 500) {
      return false;
    }
  }

  // Validate color (hex color format)
  if (data.color !== undefined) {
    if (typeof data.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate player movement input
 * @param {Object} inputData - Movement input data
 * @returns {boolean} - Whether input is valid
 */
function validateMovementInput(inputData) {
  if (!inputData || typeof inputData !== 'object') {
    return false;
  }

  // Validate target angle
  if (inputData.targetAngle !== undefined) {
    if (typeof inputData.targetAngle !== 'number' || 
        inputData.targetAngle < -Math.PI * 2 || 
        inputData.targetAngle > Math.PI * 2) {
      return false;
    }
  }

  // Validate boosting flag
  if (inputData.boosting !== undefined) {
    if (typeof inputData.boosting !== 'boolean') {
      return false;
    }
  }

  // Validate shooting flag
  if (inputData.shooting !== undefined) {
    if (typeof inputData.shooting !== 'boolean') {
      return false;
    }
  }

  // Validate timestamp
  if (inputData.timestamp !== undefined) {
    if (typeof inputData.timestamp !== 'number' || inputData.timestamp < 0) {
      return false;
    }
  }

  return true;
}

/**
 * Validate shooting input data
 * @param {Object} shootData - Shooting input data
 * @returns {boolean} - Whether data is valid
 */
function validateShootInput(shootData) {
  if (!shootData || typeof shootData !== 'object') {
    return false;
  }

  // Validate target coordinates
  if (shootData.targetX !== undefined) {
    if (typeof shootData.targetX !== 'number' || 
        shootData.targetX < -10000 || shootData.targetX > 10000) {
      return false;
    }
  }

  if (shootData.targetY !== undefined) {
    if (typeof shootData.targetY !== 'number' || 
        shootData.targetY < -10000 || shootData.targetY > 10000) {
      return false;
    }
  }

  // Validate weapon slot
  if (shootData.weaponSlot !== undefined) {
    if (!['primaryWeapon', 'secondaryWeapon', 'sidearm'].includes(shootData.weaponSlot)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate weapon switch input
 * @param {Object} weaponData - Weapon switch data
 * @returns {boolean} - Whether data is valid
 */
function validateWeaponSwitch(weaponData) {
  if (!weaponData || typeof weaponData !== 'object') {
    return false;
  }

  // Validate weapon slot
  if (!weaponData.slot || !['primaryWeapon', 'secondaryWeapon', 'sidearm'].includes(weaponData.slot)) {
    return false;
  }

  return true;
}

/**
 * Validate chat message input
 * @param {Object} messageData - Chat message data
 * @returns {boolean} - Whether data is valid
 */
function validateChatMessage(messageData) {
  if (!messageData || typeof messageData !== 'object') {
    return false;
  }

  // Validate message content
  if (!messageData.message || typeof messageData.message !== 'string') {
    return false;
  }

  if (messageData.message.length < 1 || messageData.message.length > 200) {
    return false;
  }

  // Validate timestamp
  if (messageData.timestamp !== undefined) {
    if (typeof messageData.timestamp !== 'number' || messageData.timestamp < 0) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize player data to prevent injection attacks
 * @param {Object} data - Player data to sanitize
 * @returns {Object} - Sanitized player data
 */
function sanitizePlayerData(data) {
  const sanitized = {};

  // Sanitize ID
  if (data.id) {
    sanitized.id = String(data.id).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
  }

  // Sanitize username
  if (data.username) {
    sanitized.username = String(data.username)
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, 20);
  }

  // Sanitize wager
  if (data.wager !== undefined) {
    sanitized.wager = Math.max(10, Math.min(500, Number(data.wager) || 50));
  }

  // Sanitize color
  if (data.color) {
    const colorMatch = String(data.color).match(/^#[0-9A-Fa-f]{6}$/);
    sanitized.color = colorMatch ? colorMatch[0] : '#FFD700';
  }

  // Sanitize game mode
  if (data.gameMode) {
    sanitized.gameMode = ['classic', 'warfare'].includes(data.gameMode) ? data.gameMode : 'classic';
  }

  return sanitized;
}

/**
 * Sanitize movement input data
 * @param {Object} inputData - Input data to sanitize
 * @returns {Object} - Sanitized input data
 */
function sanitizeMovementInput(inputData) {
  const sanitized = {};

  // Sanitize target angle
  if (inputData.targetAngle !== undefined) {
    let angle = Number(inputData.targetAngle) || 0;
    // Normalize angle to -2π to 2π range
    while (angle > Math.PI * 2) angle -= Math.PI * 2;
    while (angle < -Math.PI * 2) angle += Math.PI * 2;
    sanitized.targetAngle = angle;
  }

  // Sanitize boolean flags
  if (inputData.boosting !== undefined) {
    sanitized.boosting = Boolean(inputData.boosting);
  }

  if (inputData.shooting !== undefined) {
    sanitized.shooting = Boolean(inputData.shooting);
  }

  // Sanitize timestamp
  if (inputData.timestamp !== undefined) {
    sanitized.timestamp = Math.max(0, Number(inputData.timestamp) || Date.now());
  }

  return sanitized;
}

/**
 * Sanitize chat message
 * @param {Object} messageData - Message data to sanitize
 * @returns {Object} - Sanitized message data
 */
function sanitizeChatMessage(messageData) {
  const sanitized = {};

  // Sanitize message content
  if (messageData.message) {
    sanitized.message = String(messageData.message)
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .trim()
      .substring(0, 200);
  }

  // Sanitize timestamp
  if (messageData.timestamp !== undefined) {
    sanitized.timestamp = Math.max(0, Number(messageData.timestamp) || Date.now());
  }

  return sanitized;
}

/**
 * Rate limiting helper
 * @param {Map} rateLimitMap - Map to store rate limit data
 * @param {string} key - Key to rate limit (usually player ID)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether request is allowed
 */
function checkRateLimit(rateLimitMap, key, maxRequests, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const requests = rateLimitMap.get(key);
  
  // Remove old requests outside the window
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }

  // Check if under limit
  if (requests.length < maxRequests) {
    requests.push(now);
    return true;
  }

  return false;
}

module.exports = {
  validatePlayerInput,
  validateMovementInput,
  validateShootInput,
  validateWeaponSwitch,
  validateChatMessage,
  sanitizePlayerData,
  sanitizeMovementInput,
  sanitizeChatMessage,
  checkRateLimit
};
