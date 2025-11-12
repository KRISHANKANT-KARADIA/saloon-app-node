// middlewares/actionLogger.js
export const actionLogger = (actionMessage) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      // Log the action with user info
      const userId = res.locals.user?.id || 'Unknown user';
      console.log(`[ActionLog] User: ${userId}, Route: ${req.originalUrl}, Action: ${actionMessage}`);
      
      // Optionally, parse response body
      // const responseBody = typeof body === 'string' ? JSON.parse(body) : body;

      // TODO: Send notification here (email, push, slack, etc.)

      originalSend.apply(this, arguments);
    };

    next();
  };
};
