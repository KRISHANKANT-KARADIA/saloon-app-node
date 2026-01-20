// middlewares/actionLogger.js
export const actionLogger = (actionMessage) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
    
      const userId = res.locals.user?.id || 'Unknown user';
      console.log(`[ActionLog] User: ${userId}, Route: ${req.originalUrl}, Action: ${actionMessage}`);
      
      originalSend.apply(this, arguments);
    };

    next();
  };
};
