export const STATUS_CODES = {
  OK: 200,
  SUCCESSFULLY_CREATED: 201,
  REDIRECT: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};


export const userAuthRequiredFields = {
  USERNAME: 'username',
  PASSWORD: 'password'
};


export const blogCreationRequiredFields = {
  USER_ID: 'userId',
  TITLE: 'title',
  DESCRIPTION: 'description'
};


export const possibleBlogUpdateFields = {
  TITLE: 'title',
  DESCRIPTION: 'description'
};


export const userUpdateFields = {
  USERNAME: 'username'
};


export const dbErrorCodes = {
  ER_DUP_ENTRY: 'ER_DUP_ENTRY'
};


export const jwtExpiry = 1 * 60 * 60;


export const cookieAttributeForJwtToken = 'jwt_token';
