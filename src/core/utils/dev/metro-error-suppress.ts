/**
 * Metro/Hermes InternalBytecode ENOENT suppression (development only)
 *
 * Hermes stack traces sometimes include a fake file called `InternalBytecode.js`.
 * When Metro tries to read that file for symbolication it throws ENOENT, flooding
 * the console with red boxes although the JS thread is fine.
 *
 * We monkey-patch `console.error` to filter those specific messages so developer
 * logs remain useful without the noise.
 */

// Only in dev — never run this in production bundles.
if (__DEV__) {
  const originalConsoleError = console.error.bind(console);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
    const first = args[0];
    
    // Filter InternalBytecode.js ENOENT errors in various formats
    if (typeof first === 'string') {
      // Direct ENOENT message
      if (first.includes('InternalBytecode.js') && first.includes('ENOENT')) {
        return;
      }
      
      // Full error object string
      if (first.includes('Error: ENOENT') && first.includes('InternalBytecode.js')) {
        return;
      }
      
      // Metro server error format
      if (first.includes('no such file or directory') && first.includes('InternalBytecode.js')) {
        return;
      }
    }

    // Error objects
    if (first instanceof Error) {
      if (first.message && first.message.includes('InternalBytecode.js') && 
          (first.message.includes('ENOENT') || first.message.includes('no such file or directory'))) {
        return;
      }
      
      // Check stack trace
      if (first.stack && first.stack.includes('InternalBytecode.js')) {
        return;
      }
      
      // Check if error name or code indicates ENOENT
      if ((first.name === 'Error' || (first as any).code === 'ENOENT') && 
          first.message && first.message.includes('InternalBytecode.js')) {
        return;
      }
    }
    
    // Object with errno property (Node.js style errors)
    if (first && typeof first === 'object' && 'errno' in first && 'path' in first) {
      if (String(first.path).includes('InternalBytecode.js')) {
        return;
      }
    }
    
    // Handle the specific error format from your logs
    if (first && typeof first === 'object' && first.stack) {
      if (first.stack.includes('InternalBytecode.js') && 
          (first.stack.includes('ENOENT') || first.stack.includes('readFileSync'))) {
        return;
      }
    }

    // Check all arguments for InternalBytecode references
    const allArgsString = args.map(arg => 
      typeof arg === 'string' ? arg : 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    if (allArgsString.includes('InternalBytecode.js') && 
        (allArgsString.includes('ENOENT') || allArgsString.includes('no such file or directory'))) {
      return;
    }

    originalConsoleError(...args);
  };
} 