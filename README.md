## mixed-port: 7897
```
export HTTPS_PROXY=http://127.0.0.1:7897
export HTTP_PROXY=http://127.0.0.1:7897
```

## Revert permission for account
https://myaccount.google.com/permissions

## Create an encryption key
```
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Refresh Token for user
```
curl -X POST http://localhost:4000/api/refresh-token \
-H "Content-Type: application/json" \
-d '{"userId": "YOUR_USER_ID"}'
```

## MongoDB
```
brew services start mongodb/brew/mongodb-community
brew services list
default port: 27017
```