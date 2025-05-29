/**
 * Main utilities export file for the Hoy app
 * 
 * This file provides a central export point for all utility modules.
 * Import specific modules or functions from this file:
 * 
 * import { api, storage, formatting } from '../utils';
 * OR
 * import { formatPrice, isValidEmail } from '../utils';
 */

import * as apiUtils from './api';
import * as assetUtils from './asset';
import * as errorUtils from './error';
import * as formattingUtils from './formatting';
import * as logUtils from './log';
import * as networkUtils from './network';
import * as storageUtils from './storage';
import * as validationUtils from './validation';
import * as eventEmitterUtils from './eventEmitter';
import * as mockDataUtils from './mockData';

// Export namespaces to avoid property conflicts
export const api = apiUtils;
export const asset = assetUtils;
export const error = errorUtils;
export const formatting = formattingUtils;
export const log = logUtils;
export const network = networkUtils;
export const storage = storageUtils;
export const validation = validationUtils;
export const eventEmitter = eventEmitterUtils;
export const mockData = mockDataUtils;